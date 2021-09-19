using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyReviewProject.Models;

namespace MyReviewProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly MyReviewDBContext _context;

        public CommentsController(MyReviewDBContext context)
        {
            _context = context;
        }

        //not used yet
        // GET: api/Comments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CommentsTbl>>> GetCommentsTbls()
        {
            return await _context.CommentsTbls.ToListAsync();
        }

        //fetch all comments on certain review
        // GET: api/Comments/5
        [HttpGet("{id}")]
        public IEnumerable<CommentsTbl> GetCommentsTbl(string id)
        {
            return _context.CommentsTbls.Where(m => m.ReviewIdcommentedOn == id).ToArray();
        }

        //Edit
        // PUT: api/Comments/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCommentsTbl(string id, CommentsTbl commentsTbl)
        {
            if (id != commentsTbl.Id)
            {
                return BadRequest();
            }

            _context.Entry(commentsTbl).State = EntityState.Modified;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        //Generate Hash code of ID
        public string IdGenerator()
        {
            var bytes = new byte[16];
            using (var rng = new RNGCryptoServiceProvider())
            {
                rng.GetBytes(bytes);
            }

            // and if you need it as a string...
            string hash1 = BitConverter.ToString(bytes);

            return hash1;
        }

        //Create
        // POST: api/Comments
        [HttpPost]
        public async Task<ActionResult<CommentsTbl>> PostCommentsTbl(CommentsTbl commentsTbl)
        {
            commentsTbl.Id = IdGenerator();
            commentsTbl.Date = DateTime.Now;
            _context.CommentsTbls.Add(commentsTbl);
            var reviewtbl = await _context.ReviewsTbls.FindAsync(commentsTbl.ReviewIdcommentedOn);
            reviewtbl.NoOfComments += 1;

            _context.Entry(reviewtbl).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCommentsTbl", new { id = commentsTbl.Id }, commentsTbl);
        }

        // DELETE: api/Comments/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCommentsTbl(string id)
        {
            var commentsTbl = await _context.CommentsTbls.FindAsync(id);
            if (commentsTbl == null)
            {
                return NotFound();
            }

            _context.CommentsTbls.Remove(commentsTbl);
            var reviewtbl = await _context.ReviewsTbls.FindAsync(commentsTbl.ReviewIdcommentedOn);
            if (reviewtbl.NoOfComments > 0)
            {
                reviewtbl.NoOfComments -= 1;
                _context.Entry(reviewtbl).State = EntityState.Modified;
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CommentsTblExists(string id)
        {
            return _context.CommentsTbls.Any(e => e.Id == id);
        }
    }
}
