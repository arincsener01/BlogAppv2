using CORE.APP.Features;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using APP.BLOG.Domain;
using System.Globalization;

namespace APP.BLOG.Features
{
    public abstract class BlogDbHandler : Handler
    {
        protected readonly BlogDb _db;
        protected BlogDbHandler(BlogDb db): base(new CultureInfo("en-US")) // tr-TR: Turkish
        {
            _db = db;
        }
    }
}
