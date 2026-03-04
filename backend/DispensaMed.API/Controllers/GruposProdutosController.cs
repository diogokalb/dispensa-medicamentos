using DispensaMed.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DispensaMed.API.Controllers;

[ApiController]
[Route("api/grupos-produtos")]
[Authorize]
public class GruposProdutosController : ControllerBase
{
    private readonly IGrupoProdutoService _service;

    public GruposProdutosController(IGrupoProdutoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await _service.GetAllAsync());
}
