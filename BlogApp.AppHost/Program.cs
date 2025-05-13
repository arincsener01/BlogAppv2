var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.API_BLOG>("api-blog");

builder.AddProject<Projects.API_Users>("api-users");

builder.AddProject<Projects.API_Gateway>("api-gateway");

builder.Build().Run();
