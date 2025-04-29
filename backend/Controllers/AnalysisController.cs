using Microsoft.AspNetCore.Mvc;

namespace MedicalAesthetics.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly ILogger<AnalysisController> _logger;
    private const int MaxFileSize = 10 * 1024 * 1024; // 10MB
    private readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png" };

    public AnalysisController(ILogger<AnalysisController> logger)
    {
        _logger = logger;
    }

    [HttpPost("analyze")]
    public async Task<IActionResult> AnalyzeImage(IFormFile image)
    {
        if (image == null || image.Length == 0)
        {
            return BadRequest("请选择要上传的图片");
        }

        // 验证文件大小
        if (image.Length > MaxFileSize)
        {
            return BadRequest("图片大小不能超过10MB");
        }

        // 验证文件类型
        var extension = Path.GetExtension(image.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            return BadRequest("只支持 JPG、JPEG 和 PNG 格式的图片");
        }

        try
        {
            // 读取图片并验证是否为有效的图片文件
            using (var stream = image.OpenReadStream())
            {
                try
                {
                    using (var img = System.Drawing.Image.FromStream(stream))
                    {
                        // 验证图片尺寸
                        if (img.Width < 100 || img.Height < 100)
                        {
                            return BadRequest("图片尺寸太小，请上传更清晰的图片");
                        }
                    }
                }
                catch
                {
                    return BadRequest("无效的图片文件");
                }
            }

            // TODO: 在这里集成实际的面部分析AI服务
            // 目前返回模拟数据
            var markdownReport = @"# 医疗美容咨询报告

## 患者面部分析

### 皮肤状况
- **整体状态**: 皮肤状态良好，存在轻微色素沉着
- **肤质**: 混合性肤质，T区偏油，两颊偏干
- **色素**: 面部存在轻微色素沉着，主要集中在颧骨区域
- **纹理**: 皮肤纹理细腻，存在轻微细纹

### 面部对称性
- **左右对称性**: 面部对称性良好，左右面部比例协调
- **面部轮廓**: 面部轮廓清晰，下颌线流畅
- **五官分布**: 五官分布均匀，符合美学标准

### 面部比例
- **三庭五眼**: 面部三庭五眼比例适中，符合美学标准
- **面部轮廓**: 面部轮廓比例适中，符合美学标准
- **下巴比例**: 下巴比例适中，与面部整体协调

## 治疗建议

### 光子嫩肤
**描述**: 利用强脉冲光技术改善皮肤质地，淡化色素沉着
**预期效果**: 改善皮肤质地，提亮肤色，减少色素沉着
**治疗周期**: 建议进行3-5次治疗，每次间隔2-4周
**恢复期**: 治疗后可能有轻微红肿，1-2天内恢复

### 玻尿酸填充
**描述**: 通过注射玻尿酸改善面部轮廓，增加面部立体感
**预期效果**: 改善面部轮廓，增加面部立体感，提升整体美感
**治疗周期**: 单次治疗，效果可持续6-12个月
**恢复期**: 治疗后可能有轻微肿胀，3-5天内恢复

## 注意事项
1. 治疗前请避免使用含有视黄醇、果酸等成分的护肤品
2. 治疗后请避免剧烈运动和高温环境
3. 治疗后请使用温和的护肤品，避免刺激
4. 如有任何不适，请及时就医

## 免责声明
本报告仅供参考，不构成医疗建议。具体治疗方案请遵医嘱。
";

            return Ok(new { report = markdownReport });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing image");
            return StatusCode(500, "图片分析过程中发生错误，请稍后重试");
        }
    }
} 