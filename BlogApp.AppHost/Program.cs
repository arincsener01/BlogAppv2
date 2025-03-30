var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.API_BLOG>("api-blog");

builder.Build().Run();
