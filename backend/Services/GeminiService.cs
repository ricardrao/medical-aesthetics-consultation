using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace MedicalAesthetics.API.Services;

public class GeminiService
{
    private readonly string _apiKey;
    private readonly ILogger<GeminiService> _logger;
    private readonly HttpClient _httpClient;

    public GeminiService(IConfiguration configuration, ILogger<GeminiService> logger)
    {
        _logger = logger;
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new ArgumentNullException("Gemini:ApiKey is not configured");
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<string> AnalyzeImageAsync(byte[] imageData, string systemPrompt)
    {
        try
        {
            _logger.LogInformation("开始调用 Gemini API 分析图像...");
            
            var base64Image = Convert.ToBase64String(imageData);
            
            var requestBody = new
            {
                contents = new List<object>
                {
                    new
                    {
                        parts = new List<object>
                        {
                            new
                            {
                                text = systemPrompt
                            },
                            new
                            {
                                inline_data = new
                                {
                                    mime_type = "image/jpeg",
                                    data = base64Image
                                }
                            }
                        }
                    }
                },
                generation_config = new
                {
                    temperature = 0.4,
                    topK = 32,
                    topP = 1,
                    maxOutputTokens = 2048
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={_apiKey}",
                content
            );

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Gemini API 调用失败: {errorContent}");
                throw new Exception($"Gemini API 调用失败: {response.StatusCode}");
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var responseObject = JsonSerializer.Deserialize<JsonElement>(responseContent);

            if (responseObject.TryGetProperty("candidates", out var candidates) &&
                candidates.GetArrayLength() > 0 &&
                candidates[0].TryGetProperty("content", out var contentElement) &&
                contentElement.TryGetProperty("parts", out var parts) &&
                parts.GetArrayLength() > 0 &&
                parts[0].TryGetProperty("text", out var textElement))
            {
                var result = textElement.GetString();
                _logger.LogInformation($"分析结果长度: {result?.Length ?? 0} 字符");
                return result ?? "未能获取分析结果";
            }

            _logger.LogWarning("未收到有效的分析结果");
            return "未能获取分析结果";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "调用 Gemini API 时发生错误");
            throw new Exception("Error analyzing image with Gemini", ex);
        }
    }
} 