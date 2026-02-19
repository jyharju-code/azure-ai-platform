terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    azapi = {
      source  = "Azure/azapi"
      version = "~> 2.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "terraform-state-rg"
    storage_account_name = "tfstateaiplatform"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = false
    }
  }
}

provider "azapi" {}

data "azurerm_client_config" "current" {}

locals {
  project_name = "ai-platform"
  environment  = "dev"
  location     = "northeurope"
}

resource "azurerm_resource_group" "main" {
  name     = "${local.project_name}-rg-${local.environment}"
  location = local.location
}

# Managed Identity
resource "azurerm_user_assigned_identity" "main" {
  name                = "${local.project_name}-identity-${local.environment}"
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
}

# DNS Zone for PostgreSQL
resource "azurerm_private_dns_zone" "postgres" {
  name                = "${local.project_name}-${local.environment}.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.main.name
}

# Modules
module "vnet" {
  source              = "../../modules/vnet"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "postgres-vnet-link"
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  resource_group_name   = azurerm_resource_group.main.name
  virtual_network_id    = module.vnet.vnet_id
}

module "log_analytics" {
  source              = "../../modules/log-analytics"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
}

module "acr" {
  source              = "../../modules/container-registry"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
}

module "key_vault" {
  source              = "../../modules/key-vault"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  subnet_id           = module.vnet.keyvault_subnet_id
}

module "aca_environment" {
  source                     = "../../modules/container-app-environment"
  project_name               = local.project_name
  environment                = local.environment
  location                   = local.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = module.log_analytics.id
  subnet_id                  = module.vnet.aca_subnet_id
}

module "postgresql" {
  source              = "../../modules/postgresql"
  project_name        = local.project_name
  environment         = local.environment
  location            = local.location
  resource_group_name = azurerm_resource_group.main.name
  db_subnet_id        = module.vnet.db_subnet_id
  private_dns_zone_id = azurerm_private_dns_zone.postgres.id
  admin_password      = var.db_admin_password
}

module "web_app" {
  source                       = "../../modules/container-app"
  project_name                 = local.project_name
  environment                  = local.environment
  location                     = local.location
  resource_group_name          = azurerm_resource_group.main.name
  container_app_environment_id = module.aca_environment.id
  acr_login_server             = module.acr.login_server
  managed_identity_id          = azurerm_user_assigned_identity.main.id
  env_vars = {
    DATABASE_URL    = module.postgresql.connection_string
    NEXTAUTH_URL    = "https://${module.aca_environment.default_domain}"
  }
}

# Role assignments
resource "azurerm_role_assignment" "acr_pull" {
  scope                = module.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_user_assigned_identity.main.principal_id
}

resource "azurerm_role_assignment" "kv_secrets" {
  scope                = module.key_vault.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.main.principal_id
}
