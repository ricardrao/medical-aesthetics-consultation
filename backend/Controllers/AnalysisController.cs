using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using MedicalAesthetics.API.Services;
using System;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;

namespace MedicalAesthetics.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalysisController : ControllerBase
    {
        private readonly GeminiService _geminiService;
        private readonly ILogger<AnalysisController> _logger;

        public AnalysisController(GeminiService geminiService, ILogger<AnalysisController> logger)
        {
            _geminiService = geminiService;
            _logger = logger;
        }

        [HttpPost("analyze")]
        public async Task<IActionResult> AnalyzeImage([FromForm] IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest("No image uploaded.");

            using var ms = new MemoryStream();
            await image.CopyToAsync(ms);
            var imageBytes = ms.ToArray();
             // 动态获取 mime_type
            var mimeType = image.ContentType; 
            // 写死的 systemPrompt
            var systemPrompt = "你是一个专业的医美推荐师，知道很多医美项目，可以通过用户的照片分析出她/他的缺陷，给她/他推荐适合的医美项目，帮助改善她/他的面部，让她/他更美丽或者更帅气, 请分析这张照片中的面部特征，并提供专业的医美建议。";

            var result = await _geminiService.AnalyzeImageAsync(imageBytes, mimeType, systemPrompt);

            return Ok(new
            {
                success = true,
                analysis = result,
                timestamp = DateTime.UtcNow
            });
        }
    }

    public class ImageAnalysisRequest
    {
        public required string ImageData { get; set; }
    }
} 