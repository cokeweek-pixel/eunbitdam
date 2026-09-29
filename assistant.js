(function () {
  'use strict';

  const products = [
    { name: '담수진주 비드목걸이 10~11mm', kind: ['진주', '목걸이', '선물', '격식'], price: 416000, url: 'https://smartstore.naver.com/eunbitdam/products/13723382640' },
    { name: '천연 금파호박 목걸이 6mm', kind: ['호박', '원석', '목걸이', '따뜻한'], price: 144000, url: 'https://smartstore.naver.com/eunbitdam/products/13751407484' },
    { name: '남자 호안석 팔찌 8mm', kind: ['호안석', '남성', '남자', '팔찌', '선물'], price: 88000, url: 'https://smartstore.naver.com/eunbitdam/products/13777797008' },
    { name: '천연 루비 목걸이 4mm', kind: ['루비', '원석', '목걸이', '사랑'], price: 140000, url: 'https://smartstore.naver.com/eunbitdam/products/13768643173' },
    { name: '아쿠아마린 원석 팔찌 6mm', kind: ['아쿠아마린', '원석', '팔찌', '푸른', '시원한'], price: 88000, url: 'https://smartstore.naver.com/eunbitdam/products/13657235212' },
    { name: '핑크토르마린 백수정 팔찌', kind: ['토르마린', '원석', '팔찌', '핑크', '선물'], price: 68000, url: 'https://smartstore.naver.com/eunbitdam/products/13762242553' }
  ];

  const answers = {
    care: '주얼리는 착용 후 부드러운 천으로 닦고, 공기와 습기를 피해 개별 보관해 주세요. 향수·화장품·물과의 접촉은 변색을 빠르게 할 수 있어 마지막에 착용하고 가장 먼저 빼는 것을 권해 드려요.',
    size: '목걸이는 가지고 계신 제품의 길이를 재어 비교하면 가장 정확해요. 팔찌는 손목의 가장 가는 부분을 꼭 맞게 잰 뒤 원하는 여유를 더해 주세요. 상품별 길이는 스마트스토어 상세 페이지에서 확인할 수 있습니다.',
    delivery: '정확한 제작 기간, 배송 일정, 교환·반품 조건은 주문 시점의 스마트스토어 상품 상세 안내가 기준이에요. 주문 전 확인이 어렵다면 고객센터 페이지의 채널로 문의해 주세요.',
    stone: '원석마다 고유한 색과 결, 내포물이 있어 사진과 완전히 같지 않을 수 있어요. 이는 천연 소재의 자연스러운 특징입니다. 원석에 전해지는 상징은 문화적 이야기이며 의학적 효능을 뜻하지 않아요.'
  };

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  const won = price => price.toLocaleString('ko-KR') + '원';

  function recommend(query) {
    const normalized = query.toLowerCase().replace(/\s/g, '');
    const budgetMatch = normalized.match(/(\d{1,3})만(?:원)?/);
    const budget = budgetMatch ? Number(budgetMatch[1]) * 10000 : Infinity;
    const ranked = products.map(product => ({
      product,
      score: product.kind.reduce((sum, keyword) => sum + (normalized.includes(keyword) ? 3 : 0), 0) + (product.price <= budget ? 1 : -4)
    })).filter(item => item.product.price <= budget).sort((a, b) => b.score - a.score || a.product.price - b.product.price);
    return ranked.slice(0, 2).map(item => item.product);
  }

  function replyFor(message) {
    const text = message.toLowerCase();
    if (/관리|세척|보관|변색|물|샤워/.test(text)) return { text: answers.care };
    if (/사이즈|길이|손목|몇\s?cm|센티/.test(text)) return { text: answers.size };
    if (/배송|교환|반품|제작|언제|주문/.test(text)) return { text: answers.delivery };
    if (/효능|의미|상징|천연|원석.*차이/.test(text)) return { text: answers.stone, link: { label: '원석 이야기 살펴보기', url: 'stones.html' } };
    if (/상담|문의|사람|전화/.test(text)) return { text: '제가 해결하지 못한 내용은 고객센터에서 더 정확히 안내받으실 수 있어요.', link: { label: '고객센터로 이동', url: 'contact.html' } };
    const recommendations = recommend(text);
    return {
      text: recommendations.length ? '말씀해 주신 취향과 예산을 바탕으로 이 제품부터 살펴보세요. 천연 소재라 색과 결에는 조금씩 차이가 있을 수 있습니다.' : '원하시는 종류(목걸이·팔찌), 소재나 색, 예산을 알려 주시면 어울리는 제품을 찾아드릴게요.',
      products: recommendations
    };
  }

  const root = document.createElement('aside');
  root.className = 'concierge';
  root.innerHTML = `
    <button class="conciergeLauncher" type="button" aria-expanded="false" aria-controls="conciergePanel"><span aria-hidden="true">◇</span><b>주얼리 도우미</b></button>
    <section class="conciergePanel" id="conciergePanel" aria-label="은빛담 주얼리 도우미" hidden>
      <header><div><small>EUNBITDAM CONCIERGE</small><h2>은빛담 주얼리 도우미</h2><p><i></i> 지금 상담 가능</p></div><button class="conciergeClose" type="button" aria-label="도우미 닫기">×</button></header>
      <div class="conciergeMessages" aria-live="polite"><div class="agentMessage">안녕하세요. 취향과 예산에 맞는 주얼리를 함께 찾아드릴게요. 무엇을 도와드릴까요?</div></div>
      <div class="conciergePrompts" aria-label="빠른 질문"><button type="button">10만원대 선물 추천</button><button type="button">원석 주얼리 추천</button><button type="button">관리 방법</button></div>
      <form class="conciergeForm"><label class="srOnly" for="conciergeInput">질문 입력</label><input id="conciergeInput" maxlength="160" autocomplete="off" placeholder="예: 10만원대 팔찌를 추천해 주세요" required><button type="submit" aria-label="질문 보내기">→</button></form>
      <p class="conciergeNote">추천과 일반 안내를 돕는 자동 응답입니다. 주문 정보는 수집하지 않습니다.</p>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector('.conciergeLauncher');
  const panel = root.querySelector('.conciergePanel');
  const input = root.querySelector('input');
  const messages = root.querySelector('.conciergeMessages');

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute('aria-expanded', String(open));
    root.classList.toggle('isOpen', open);
    if (open) window.setTimeout(() => input.focus(), 80);
  }

  function addMessage(content, who) {
    const item = document.createElement('div');
    item.className = who === 'user' ? 'userMessage' : 'agentMessage';
    if (who === 'user') item.textContent = content;
    else {
      item.innerHTML = `<p>${escapeHtml(content.text)}</p>`;
      if (content.products?.length) {
        const list = document.createElement('div');
        list.className = 'conciergeResults';
        content.products.forEach(product => {
          const link = document.createElement('a');
          link.href = product.url; link.target = '_blank'; link.rel = 'noopener';
          link.innerHTML = `<span>${escapeHtml(product.name)}</span><strong>${won(product.price)} · 보기 →</strong>`;
          list.appendChild(link);
        });
        item.appendChild(list);
      }
      if (content.link) {
        const link = document.createElement('a');
        link.className = 'conciergeTextLink'; link.href = content.link.url; link.textContent = content.link.label + ' →';
        item.appendChild(link);
      }
    }
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  function ask(value) {
    const question = value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    window.setTimeout(() => addMessage(replyFor(question), 'agent'), 280);
  }

  launcher.addEventListener('click', () => setOpen(panel.hidden));
  root.querySelector('.conciergeClose').addEventListener('click', () => setOpen(false));
  root.querySelector('.conciergeForm').addEventListener('submit', event => { event.preventDefault(); ask(input.value); });
  root.querySelectorAll('.conciergePrompts button').forEach(button => button.addEventListener('click', () => ask(button.textContent)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) setOpen(false); });
})();
