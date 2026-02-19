variable "model_slug" {
  type = string
}

variable "model_hf_id" {
  type        = string
  description = "HuggingFace model ID, e.g. mistralai/Mistral-7B-Instruct-v0.3"
}

variable "location" {
  type = string
}

variable "resource_group_id" {
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

variable "key_vault_uri" {
  type = string
}

variable "max_model_len" {
  type    = number
  default = 4096
}

variable "gpu_type" {
  type    = string
  default = "nvidia-t4"
}

# GPU-enabled Container App for vLLM
# Uses azapi provider because azurerm doesn't support GPU workload profiles
resource "azapi_resource" "vllm_model_app" {
  type      = "Microsoft.App/containerApps@2024-10-02-preview"
  name      = "${var.model_slug}-vllm"
  location  = var.location
  parent_id = var.resource_group_id

  identity {
    type         = "UserAssigned"
    identity_ids = [var.managed_identity_id]
  }

  body = {
    properties = {
      managedEnvironmentId = var.container_app_environment_id
      workloadProfileName  = "Consumption"

      configuration = {
        ingress = {
          external   = false
          targetPort = 8000
          transport  = "http"
        }
        registries = [{
          server   = var.acr_login_server
          identity = var.managed_identity_id
        }]
        secrets = [
          {
            name        = "hf-token"
            keyVaultUrl = "${var.key_vault_uri}secrets/hf-token"
            identity    = var.managed_identity_id
          },
          {
            name        = "vllm-api-key"
            keyVaultUrl = "${var.key_vault_uri}secrets/vllm-api-key"
            identity    = var.managed_identity_id
          }
        ]
      }

      template = {
        containers = [{
          name  = "vllm"
          image = "${var.acr_login_server}/vllm-server:latest"
          resources = {
            cpu    = 8
            memory = "16Gi"
          }
          env = [
            { name = "MODEL_NAME", value = var.model_hf_id },
            { name = "MAX_MODEL_LEN", value = tostring(var.max_model_len) },
            { name = "GPU_MEMORY_UTILIZATION", value = "0.9" },
            { name = "HF_TOKEN", secretRef = "hf-token" },
            { name = "VLLM_API_KEY", secretRef = "vllm-api-key" },
          ]
          probes = [{
            type = "liveness"
            httpGet = {
              path = "/health"
              port = 8000
            }
            initialDelaySeconds = 120
            periodSeconds       = 30
          }]
        }]
        scale = {
          minReplicas = 0
          maxReplicas = 1
          rules = [{
            name = "http-scaler"
            http = {
              metadata = {
                concurrentRequests = "10"
              }
            }
          }]
        }
      }
    }
  }
}

output "fqdn" {
  value = azapi_resource.vllm_model_app.output.properties.configuration.ingress.fqdn
}

output "resource_id" {
  value = azapi_resource.vllm_model_app.id
}
