// Dados de agendamentos (simulando localStorage)
let agendamentos = [];

// Carregar agendamentos salvos
function loadAgendamentos() {
    const saved = localStorage.getItem('agendamentos');
    if (saved) {
        agendamentos = JSON.parse(saved);
    }
}

// Salvar agendamentos
function saveAgendamentos() {
    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

// Mostrar toast
function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    toastMessage.textContent = message;
    
    if (isError) {
        toast.style.background = '#ef4444';
    } else {
        toast.style.background = '#10b981';
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Gerar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Verificar disponibilidade de horário
function isHorarioDisponivel(data, hora) {
    return !agendamentos.some(a => a.data === data && a.hora === hora);
}

// Salvar agendamento
function salvarAgendamento(dados) {
    const novoAgendamento = {
        id: generateId(),
        ...dados,
        dataCriacao: new Date().toISOString(),
        status: 'pendente'
    };
    
    agendamentos.push(novoAgendamento);
    saveAgendamentos();
    return novoAgendamento;
}

// Enviar confirmação via WhatsApp (simulação)
function enviarConfirmacaoWhatsApp(telefone, nome, servico, data, hora) {
    const mensagem = `Olá ${nome}! ✅ Seu agendamento foi confirmado.\n\n📋 Serviço: ${servico}\n📅 Data: ${data}\n⏰ Horário: ${hora}\n\nPrecisa de ajuda? É só responder esta mensagem.`;
    const url = `https://wa.me/55${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
    // Abre o WhatsApp em nova aba (simulação)
    window.open(url, '_blank');
}

// Enviar e-mail de confirmação (simulação)
function enviarEmailConfirmacao(email, nome, servico, data, hora, tipoAtendimento) {
    console.log(`E-mail enviado para ${email}: Agendamento confirmado para ${servico} em ${data} às ${hora}`);
    // Aqui seria integração com API de e-mail real
}

// Fechar modal
function closeModal() {
    const modal = document.getElementById('agendamentoModal');
    modal.style.display = 'none';
}

// Abrir modal
function openModal(servicoPreSelecionado = '') {
    const modal = document.getElementById('agendamentoModal');
    const servicoSelect = document.getElementById('servico');
    
    if (servicoPreSelecionado && servicoSelect) {
        servicoSelect.value = servicoPreSelecionado;
    }
    
    modal.style.display = 'flex';
}

// Resetar formulário
function resetForm() {
    const form = document.getElementById('agendamentoForm');
    form.reset();
}

// Inicializar data mínima (próximos dias)
function setMinDate() {
    const dataInput = document.getElementById('data');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dataInput.min = tomorrow.toISOString().split('T')[0];
}

// Validar telefone
function validarTelefone(telefone) {
    const regex = /^\(?[1-9]{2}\)? ?[9]?[0-9]{4}-?[0-9]{4}$/;
    return regex.test(telefone) || telefone.replace(/\D/g, '').length >= 10;
}

// Processar formulário
function handleSubmit(event) {
    event.preventDefault();
    
    // Coletar dados
    const servico = document.getElementById('servico').value;
    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const tipoAtendimento = document.getElementById('tipoAtendimento').value;
    const observacoes = document.getElementById('observacoes').value;
    
    // Validações
    if (!servico || !nome || !email || !telefone || !data || !hora || !tipoAtendimento) {
        showToast('Por favor, preencha todos os campos obrigatórios.', true);
        return;
    }
    
    if (!validarTelefone(telefone)) {
        showToast('Por favor, informe um número de WhatsApp válido.', true);
        return;
    }
    
    if (!isHorarioDisponivel(data, hora)) {
        showToast('Horário indisponível. Por favor, escolha outro horário.', true);
        return;
    }
    
    // Salvar agendamento
    const agendamento = salvarAgendamento({
        servico,
        nome,
        email,
        telefone,
        data,
        hora,
        tipoAtendimento,
        observacoes
    });
    
    // Enviar confirmações
    enviarConfirmacaoWhatsApp(telefone, nome, servico, data, hora);
    enviarEmailConfirmacao(email, nome, servico, data, hora, tipoAtendimento);
    
    // Sucesso
    showToast(`✅ Agendamento confirmado! Enviamos a confirmação para ${telefone} via WhatsApp.`);
    
    // Fechar modal e resetar formulário
    closeModal();
    resetForm();
    
    // Atualizar horários disponíveis (opcional)
    atualizarHorariosDisponiveis();
}

// Atualizar lista de horários disponíveis (simples)
function atualizarHorariosDisponiveis() {
    const dataSelecionada = document.getElementById('data').value;
    const horaSelect = document.getElementById('hora');
    
    if (!dataSelecionada) return;
    
    const horarios = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
    const horariosOcupados = agendamentos
        .filter(a => a.data === dataSelecionada)
        .map(a => a.hora);
    
    horaSelect.innerHTML = '<option value="">Selecione</option>';
    
    horarios.forEach(horario => {
        if (!horariosOcupados.includes(horario)) {
            const option = document.createElement('option');
            option.value = horario;
            option.textContent = horario;
            horaSelect.appendChild(option);
        }
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadAgendamentos();
    setMinDate();
    
    // Modal
    const modal = document.getElementById('agendamentoModal');
    const closeBtn = document.querySelector('.close');
    const openModalBtn = document.getElementById('openModalBtn');
    const heroAgendarBtn = document.getElementById('heroAgendarBtn');
    
    // Botões de agendamento nos cards
    const btnAgendarServicos = document.querySelectorAll('.btn-agendar-servico');
    btnAgendarServicos.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const servico = btn.getAttribute('data-servico');
            openModal(servico);
        });
    });
    
    // Botões de assinatura
    const btnAssinar = document.querySelectorAll('.btn-assinar');
    btnAssinar.forEach(btn => {
        btn.addEventListener('click', () => {
            const plano = btn.getAttribute('data-plano');
            openModal(plano);
            const servicoSelect = document.getElementById('servico');
            if (servicoSelect) {
                servicoSelect.value = plano;
            }
        });
    });
    
    if (openModalBtn) openModalBtn.addEventListener('click', () => openModal());
    if (heroAgendarBtn) heroAgendarBtn.addEventListener('click', () => openModal());
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Fechar modal clicando fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Form submit
    const form = document.getElementById('agendamentoForm');
    if (form) form.addEventListener('submit', handleSubmit);
    
    // Atualizar horários ao mudar data
    const dataInput = document.getElementById('data');
    if (dataInput) {
        dataInput.addEventListener('change', atualizarHorariosDisponiveis);
    }
    
    // Menu mobile toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '70px';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'white';
            navLinks.style.padding = '1rem';
            navLinks.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)';
        });
    }
    
    // Scroll suave para links âncora
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                if (navLinks.style.display === 'flex') {
                    navLinks.style.display = 'none';
                }
            }
        });
    });
});

// Exportar funções para uso em outras páginas (se necessário)
window.digiHelpHub = {
    agendar: openModal,
    getAgendamentos: () => agendamentos
};
