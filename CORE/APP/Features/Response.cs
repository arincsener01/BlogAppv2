using CORE.APP.Domain;

namespace CORE.APP.Features
{
    public class CommandResponse : Entity
    {
        public bool Success { get; }
        public string Message { get; }
        public CommandResponse(bool isSuccessful, string message = "", int id = 0) : base(id)
        {
            Success = isSuccessful;
            Message = message;
        }
    }
    public class QueryResponse : Entity
    {

    }
}
