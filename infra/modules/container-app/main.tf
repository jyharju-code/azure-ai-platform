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

variable "container_app_environment_id" {
  type = string
}

variable "acr_login_server" {
  type = string
}

variable "managed_identity_id" {
  type = string
}

variable "image_tag" {
  type    = string
  default = "latest"
}

variable "env_vars" {
  type    = map(string)
  default = {}
}

variable "secrets" {
  type = list(object({
    name         = string
    key_vault_url = string
    identity     = string
  }))
  default = []
}

resource "azurerm_container_app" "web" {
  name                         = "${var.project_name}-web-${var.environment}"
  container_app_environment_id = var.container_app_environment_id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [var.managed_identity_id]
  }

  registry {
    server   = var.acr_login_server
    identity = var.managed_identity_id
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    transport        = "http"

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 1
    max_replicas = 3

    container {
      name   = "web"
      image  = "${var.acr_login_server}/${var.project_name}-web:${var.image_tag}"
      cpu    = 0.5
      memory = "1Gi"

      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }
    }
  }
}

output "fqdn" {
  value = azurerm_container_app.web.ingress[0].fqdn
}

output "url" {
  value = "https://${azurerm_container_app.web.ingress[0].fqdn}"
}
