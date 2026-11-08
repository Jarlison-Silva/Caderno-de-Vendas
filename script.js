// Cada venda guardada: { produto, quantidade, valor (de cada unidade), momento }

// 1. Pega os elementos da página
const form = document.getElementById('formVenda');
const lista = document.getElementById('listaVendas');
const totalSpan = document.getElementById('totalDia');
const diasAnteriores = document.getElementById('diasAnteriores');
const listaDias = document.getElementById('listaDias');

// 2. Carrega as vendas salvas ou começa com uma lista vazia
let vendas = JSON.parse(localStorage.getItem('cadernoDeVendas')) || [];

// 3. Funções auxiliares
const dinheiro = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dia = (momento) => new Date(momento).toLocaleDateString('pt-BR'); // ex: 07/11/2026
const hora = (momento) => new Date(momento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const totalDe = (grupo) => grupo.reduce((soma, v) => soma + v.quantidade * v.valor, 0);

// 4. Cria a linha de uma venda
function criarItem(v) {
    const li = document.createElement('li');

    // textContent mostra o que foi digitado como texto puro (mais seguro que innerHTML)
    const texto = document.createElement('span');
    texto.textContent = `${hora(v.momento)} - ${v.quantidade}x ${v.produto}: ${dinheiro(v.quantidade * v.valor)}`;
    li.append(texto);

    const botao = document.createElement('button');
    botao.className = 'btn-remover';
    botao.textContent = 'X';
    botao.setAttribute('aria-label', 'Remover venda');
    botao.dataset.momento = v.momento;
    li.append(botao);

    return li;
}

// 5. Atualiza o que aparece na tela e salva
function atualizar() {
    const hoje = dia(Date.now());
    const recentes = [...vendas].sort((a, b) => b.momento - a.momento); // mais nova primeiro
    const vendasHoje = recentes.filter((v) => dia(v.momento) === hoje);
    const vendasAntigas = recentes.filter((v) => dia(v.momento) !== hoje);

    // Vendas e total de hoje
    lista.innerHTML = '';
    vendasHoje.forEach((v) => lista.append(criarItem(v)));
    totalSpan.textContent = dinheiro(totalDe(vendasHoje));

    // Dias anteriores: agrupa as vendas pela data
    const porDia = {};
    vendasAntigas.forEach((v) => {
        const d = dia(v.momento);
        porDia[d] = porDia[d] || [];
        porDia[d].push(v);
    });

    // Lembra quais dias estavam abertos, para não fecharem ao remover uma venda
    const abertos = [...listaDias.querySelectorAll('details[open]')].map((el) => el.dataset.dia);

    listaDias.innerHTML = '';
    for (const d in porDia) {
        const grupo = porDia[d];
        const detalhes = document.createElement('details');
        detalhes.dataset.dia = d;
        detalhes.open = abertos.includes(d);
        detalhes.innerHTML = `<summary>${d} · ${grupo.length} venda(s) · <strong>${dinheiro(totalDe(grupo))}</strong></summary><ul></ul>`;
        grupo.forEach((v) => detalhes.querySelector('ul').append(criarItem(v)));
        listaDias.append(detalhes);
    }
    diasAnteriores.hidden = vendasAntigas.length === 0;

    localStorage.setItem('cadernoDeVendas', JSON.stringify(vendas));
}

// 6. Quando clica em registrar a venda
form.addEventListener('submit', (e) => {
    e.preventDefault();

    vendas.push({
        produto: document.getElementById('produto').value.trim(),
        quantidade: Number(document.getElementById('quantidade').value),
        valor: Number(document.getElementById('valor').value),
        momento: Date.now() // também serve para identificar a venda
    });

    form.reset();
    atualizar();
    document.getElementById('produto').focus();
});

// 7. Quando clica no X de qualquer venda (de hoje ou de dias anteriores)
document.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-remover')) return;
    if (!confirm('Remover esta venda?')) return;

    vendas = vendas.filter((v) => v.momento !== Number(e.target.dataset.momento));
    atualizar();
});

// Executa ao abrir a página
atualizar();
