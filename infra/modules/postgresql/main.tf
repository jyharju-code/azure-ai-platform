variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "db_subnet_id" {
  type = string
}

variable "private_dns_zone_id" {
  type = string
}

variable "admin_username" {
  type    = string
  default = "pgadmin"
}

variable "admin_password" {
  type      = string
  sensitive = true
}

variable "sku_name" {
  type    = string
  default = "B_Standard_B1ms"
}

resource "azurerm_postgresql_flexible_server" "main" {
  name                          = "${var.project_name}-pg-${var.environment}"
  resource_group_name           = var.resource_group_name
  location                      = var.location
  version                       = "16"
  delegated_subnet_id           = var.db_subnet_id
  private_dns_zone_id           = var.private_dns_zone_id
  administrator_login           = var.admin_username
  administrator_password        = var.admin_password
  storage_mb                    = 32768
  sku_name                      = var.sku_name
  zone                          = "1"
  backup_retention_days         = 7
  geo_redundant_backup_enabled  = false

  authentication {
    active_directory_auth_enabled = true
    password_auth_enabled         = true
  }
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = "agent_platform"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

output "server_fqdn" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_name" {
  value = azurerm_postgresql_flexible_server_database.app.name
}

output "connection_string" {
  value     = "postgresql://${var.admin_username}:${var.admin_password}@${azurerm_postgresql_flexible_server.main.fqdn}:5432/${azurerm_postgresql_flexible_server_database.app.name}?sslmode=require"
  sensitive = true
}
