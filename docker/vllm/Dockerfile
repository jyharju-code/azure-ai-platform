FROM vllm/vllm-openai:latest

ENV MODEL_NAME=""
ENV MAX_MODEL_LEN=4096
ENV GPU_MEMORY_UTILIZATION=0.9
ENV VLLM_API_KEY=""

EXPOSE 8000

CMD python -m vllm.entrypoints.openai.api_server \
  --model ${MODEL_NAME} \
  --max-model-len ${MAX_MODEL_LEN} \
  --gpu-memory-utilization ${GPU_MEMORY_UTILIZATION} \
  --host 0.0.0.0 \
  --port 8000
