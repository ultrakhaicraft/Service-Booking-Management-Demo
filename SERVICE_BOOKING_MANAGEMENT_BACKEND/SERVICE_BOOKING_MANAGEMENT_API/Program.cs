using SERVICE_BOOKING_MANAGEMENT_API;
using SERVICE_BOOKING_MANAGEMENT_API.Utility;
using SERVICE_BOOKING_MANAGEMENT_BUSINESS.Utility;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontEndOrigins");

app.UseMiddleware<GlobalExceptionHandler>();


app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
