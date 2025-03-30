using APP.BLOG.Domain;
using Microsoft.EntityFrameworkCore;
using APP.BLOG.Features;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.
// IoC Container (Inversion of Control):
var connectionString = builder.Configuration.GetConnectionString("BlogDb");
builder.Services.AddDbContext<BlogDb>(options => options.UseSqlite(connectionString));
builder.Services.AddMediatR(config => config.RegisterServicesFromAssembly(typeof(BlogDbHandler).Assembly));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policyBuilder => policyBuilder
            .WithOrigins("http://localhost:3000")
            .AllowAnyMethod()
            .AllowAnyHeader());
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Add CORS middleware
app.UseCors("AllowReactApp");

app.UseAuthorization();

app.MapControllers();

app.Run();
