using MedicalAesthetics.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<GeminiService>();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// 注释掉HTTPS重定向，使用HTTP
// app.UseHttpsRedirection();

// 确保 CORS 中间件在路由中间件之前
app.UseCors("AllowReactApp");

app.UseAuthorization();
app.MapControllers();

// 配置Kestrel使用HTTP和端口5000
app.Urls.Add("http://localhost:5000");

app.Run(); 