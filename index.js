document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. INTEGRAÇÃO DE API DA BOLSA DE VALORES DA VECTRA CONTÁBIL
     ========================================================================== */
  async function fetchMarketQuotes() {
    const track = document.getElementById('tickerTrack');
    try {
      // Simulação de Fetch de Dados Financeiros (Fallback Dinâmico)
      const mockQuotes = [
        { symbol: 'IBOVESPA', val: '128.450', change: '+0.85%', up: true },
        { symbol: 'USD/BRL', val: 'R$ 4,97', change: '-0.32%', up: false },
        { symbol: 'EUR/BRL', val: 'R$ 5,38', change: '+0.12%', up: true },
        { symbol: 'BTC/BRL', val: 'R$ 325.100', change: '+2.40%', up: true },
        { symbol: 'IFIX (FIIs)', val: '3.342', change: '+0.05%', up: true },
        { symbol: 'S&P 500', val: '5.088', change: '+0.45%', up: true }
      ];

      // Duplica os dados para permitir o efeito contínuo sem solavancos
      const fullQuotes = [...mockQuotes, ...mockQuotes];

      track.innerHTML = fullQuotes.map(item => `
        <div class="ticker-item">
          <span class="symbol">${item.symbol}</span>
          <span class="value ${item.up ? 'up' : 'down'}">${item.val} (${item.change})</span>
        </div>
      `).join('');
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
    }
  }

  fetchMarketQuotes();

  /* ==========================================================================
     2. SLIDER / CAROUSEL AUTO-PLAY (10 IMAGENS | 2s | PAUSA NO HOVER)
     ========================================================================== */
  const track = document.getElementById('sliderTrack');
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const wrapper = document.getElementById('sliderWrapper');
  const indicatorsContainer = document.getElementById('sliderIndicators');

  let currentIndex = 0;
  const totalSlides = slides.length;
  let autoSlideTimer = null;

  // Criação dos indicadores dinâmicos
  slides.forEach((_, idx) => {
    const ind = document.createElement('div');
    ind.classList.add('indicator');
    if (idx === 0) ind.classList.add('active');
    ind.addEventListener('click', () => goToSlide(idx));
    indicatorsContainer.appendChild(ind);
  });

  const indicators = document.querySelectorAll('.indicator');

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === currentIndex);
    });
  }

  function goToSlide(index) {
    currentIndex = index;
    if (currentIndex >= totalSlides) currentIndex = 0;
    if (currentIndex < 0) currentIndex = totalSlides - 1;
    updateSlider();
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoSlide() {
    stopAutoSlide(); // Garante que não duplica intervalos
    autoSlideTimer = setInterval(nextSlide, 2000); // Exatos 2 segundos
  }

  function stopAutoSlide() {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
      autoSlideTimer = null;
    }
  }

  // Controlos manuais
  nextBtn.addEventListener('click', () => {
    nextSlide();
    startAutoSlide();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    startAutoSlide();
  });

  // Requisito: Pausar o auto-slide ao passar o rato (hover) por cima
  wrapper.addEventListener('mouseenter', stopAutoSlide);
  wrapper.addEventListener('mouseleave', startAutoSlide);

  // Inicializa o auto-slide
  startAutoSlide();

  /* ==========================================================================
     3. API VIACEP (PREENCHIMENTO AUTOMÁTICO DE ENDEREÇO)
     ========================================================================== */
  const cepInput = document.getElementById('cep');
  const spinner = document.getElementById('cepSpinner');
  const ufInput = document.getElementById('uf');
  const logradouroInput = document.getElementById('logradouro');
  const bairroInput = document.getElementById('bairro');
  const cidadeInput = document.getElementById('cidade');

  cepInput.addEventListener('input', (e) => {
    // Máscara de CEP 00000-000
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 5) {
      value = value.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    e.target.value = value;

    const cleanCEP = value.replace('-', '');
    if (cleanCEP.length === 8) {
      consultarViaCEP(cleanCEP);
    }
  });

  async function consultarViaCEP(cep) {
    spinner.style.display = 'block';
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        alert('CEP não encontrado! Por favor verifique o número digitado.');
        clearAddressFields();
      } else {
        logradouroInput.value = data.logradouro || '';
        bairroInput.value = data.bairro || '';
        cidadeInput.value = data.localidade || '';
        ufInput.value = data.uf || '';
      }
    } catch (err) {
      console.error('Erro ao consultar ViaCEP:', err);
    } finally {
      spinner.style.display = 'none';
    }
  }

  function clearAddressFields() {
    logradouroInput.value = '';
    bairroInput.value = '';
    cidadeInput.value = '';
    ufInput.value = '';
  }

  /* ==========================================================================
     4. API DE INSCRIÇÃO / FORMULÁRIO DE CONTATO
     ========================================================================== */
  const leadForm = document.getElementById('leadForm');
  const feedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('submitBtn');

  leadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.querySelector('span').innerText = 'A enviar...';

    // Captura dos dados
    const formData = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      telefone: document.getElementById('telefone').value,
      cep: cepInput.value,
      logradouro: logradouroInput.value,
      bairro: bairroInput.value,
      cidade: cidadeInput.value,
      uf: ufInput.value,
      servico: document.getElementById('servicoDesejado').value,
      data_inscricao: new Date().toISOString()
    };

    console.log('Dados prontos para envio à API de Inscrição:', formData);

    // Simulação da chamada da API de Inscrição com delay de 1.5s
    setTimeout(() => {
      feedback.className = 'form-feedback success';
      feedback.innerText = 'Solicitação enviada com sucesso! Um consultor entrará em contato em breve.';
      leadForm.reset();
      clearAddressFields();

      submitBtn.disabled = false;
      submitBtn.querySelector('span').innerText = 'Enviar Solicitação';

      setTimeout(() => {
        feedback.style.display = 'none';
      }, 5000);
    }, 1500);
  });
});