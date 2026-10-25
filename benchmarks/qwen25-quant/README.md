# Qwen2.5 量化质量 × 速度基准测试（bench-2026-q4-qwen25-quant）

## 产品
Ollama 本地部署场景下，Qwen2.5 0.5B/1.5B/3B 在 Q4_0 vs Q8_0 两种量化下的：
1. **答案质量**：30 题固定确定性测试集（数学 / 代码输出 / 计数 / 逻辑 / 常识）的逐题通过率
2. **推理速度**：tokens/sec（Ollama `eval_count / eval_duration`），p10 / 中位 / p90
3. **资源**：模型文件大小、runner 进程峰值 RSS、总生成 token 数

买家（AI agent 或人）拿到 `package-data.json` 后可直接用于模型选型：
「在 CPU-only / iGPU 本地部署、30 题确定性基准下，哪个 size×quant 组合质量不丢、速度最快」。

## 可复现性
- 数据全部由 `run_bench.py` 产生：`python3 run_bench.py`（需要 Ollama + 6 个模型）
- 生成参数锁定：`temperature=0, num_seed=42, top_k=1, num_predict=160`，每个 variant 先 warmup 1 题再计测
- 判分：response 做 casefold + 去全部空白后，任一 reference form 子串命中即 PASS（30 题全部有确定答案）
- 原始逐题响应存 `raw-outputs/<variant>.jsonl`（含每题 prompt / response / pass / timing），可逐条复核

## 硬件 / 软件（结果归属声明）
- Intel Core i7-1195G7 @ 2.90GHz + Iris Xe iGPU，31.7 GB RAM，Windows 11
- Ollama Windows 版（版本见 results.json `ollama_version`）
- **量化质量与设备无关**（同一模型权重的同一题答案），速度数值是本硬件的 CPU 参考点；
  在其他硬件上速度会不同，但「Q4 vs Q8 的相对差距方向」与「bigger model 更准」的结论可迁移

## 测试集设计（30 题）
| 类别 | 题数 | 设计 |
|---|---|---|
| math | 8 | 乘法链、线性方程、百分比、幂、GCD、阶乘取模、分数、圆面积 |
| code_output | 8 | 「以下 Python 代码的准确输出是？」—— 输出完全确定 |
| counting | 5 | 字母/元音计数、7 的倍数个数 |
| logic | 3 | 等比数列、三段论、workers-and-widgets 陷阱题（答案是 5 分钟，测模型会不会被 100 机器误导成 100 分钟） |
| knowledge | 6 | 中法双语接受形式（巴黎/Paris、H2O/H₂O、曹雪芹/Cao Xueqin） |

## 质量分 q 的计算（VerifierOutput.q_rubric，无主观项）
`q = 0.30×source_coverage + 0.20×freshness + 0.30×internal_consistency + 0.20×claim_specificity`
- source_coverage：8 个预期证据文件（results.json + evalset.json + run_bench.py + README + 6 个 raw jsonl）实存比例
- freshness：距生成日 ≤7 天 = 1.0，之后线性衰减
- internal_consistency：跨 variant 单调性检查（larger ≥ smaller 准确率、larger 不超 smaller 速度 1.3 倍、Q4 不慢过 Q8 一半、全部题目有应答、token 总数在物理范围内）
- claim_specificity：每个 variant 都带 accuracy / p10 / 中位 / p90 tok/s / 总 token / 文件大小 6 项数值

## 已知边界
- 30 题是选型级快速基准，不是 MMLU/GSM8K 级评测；题目量级决定 ±3-4 题的粒度
- 未测长上下文、未测多轮、未测工具调用
- 速度是单并发、冷缓存后的中位值；生产高并发场景数字会不同
