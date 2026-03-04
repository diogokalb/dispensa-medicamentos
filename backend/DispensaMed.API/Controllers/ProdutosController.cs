using DispensaMed.Application.DTOs;
using DispensaMed.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DispensaMed.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProdutosController : ControllerBase
{
    private readonly IProdutoService _service;

    public ProdutosController(IProdutoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (items, total) = await _service.GetAllAsync(search, page, pageSize);
        return Ok(new { items, total, page, pageSize });
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var produto = await _service.GetByIdAsync(id);
        if (produto is null) return NotFound();
        return Ok(produto);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProdutoCreateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var id = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpPut("{id:long}")]
    public async Task<IActionResult> Update(long id, [FromBody] ProdutoUpdateDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        await _service.UpdateAsync(id, dto);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public async Task<IActionResult> Delete(long id)
    {
        var deleted = await _service.DeleteAsync(id);
        if (!deleted)
            return Conflict(new { message = "Não é possível excluir produto com estoque." });
        return NoContent();
    }

    [HttpGet("{id:long}/lotes")]
    public async Task<IActionResult> GetLotes(long id)
        => Ok(await _service.GetLotesAsync(id));

    [HttpGet("{id:long}/barras")]
    public async Task<IActionResult> GetBarras(long id)
        => Ok(await _service.GetBarrasAsync(id));

    [HttpGet("{id:long}/componentes")]
    public async Task<IActionResult> GetComponentes(long id)
        => Ok(await _service.GetComponentesAsync(id));

    [HttpGet("{id:long}/estoque")]
    public async Task<IActionResult> GetEstoque(long id)
        => Ok(await _service.GetEstoqueAsync(id));
}
