(() => {
  "use strict";
  const config = window.SITE_CONFIG;
  const $ = (selector, root = document) => root.querySelector(selector);
  const create = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text) node.textContent = text; return node; };
  const detailCard = (label, value, copyValue, wide = false) => {
    const card = create("div", `detail${wide ? " wide" : ""}`);
    card.append(create("span", "label", label));
    const row = create("div", "value-row");
    row.append(create("strong", "", value));
    if (copyValue) { const button = create("button", "copy", "Копировать"); button.type = "button"; button.dataset.copy = copyValue; button.setAttribute("aria-label", `Копировать: ${label}`); row.append(button); }
    card.append(row); return card;
  };

  function renderSeller() {
    const s = config.seller, content = $("#seller-content");
    content.append(detailCard("Полное наименование", s.fullName, "", true), detailCard("Сокращённое наименование", s.shortName), detailCard("Юридический адрес", s.legalAddress, "", true), detailCard("Почтовый адрес", s.postalAddress, "", true), detailCard("ОГРНИП", s.ogrnip, s.ogrnip), detailCard("ИНН", s.inn, s.inn), detailCard("Дата регистрации", s.registrationDate), detailCard("ОКВЭД по карте партнёра", s.okved));
    const phone = detailCard("Телефон", s.phone, s.phone); phone.querySelector("strong").innerHTML = `<a class="email" href="tel:${s.phoneLink}">${s.phone}</a>`;
    const email = detailCard("Электронная почта", s.email, s.email); email.querySelector("strong").innerHTML = `<a class="email" href="mailto:${s.email}">${s.email}</a>`; content.append(phone, email);
    const bank = s.bank, combined = `Расчётный счёт: ${bank.account}\nБанк: ${bank.name}\nБИК: ${bank.bik}\nКорреспондентский счёт: ${bank.correspondentAccount}`;
    $("#bank-content").append(detailCard("Расчётный счёт", bank.account, bank.account), detailCard("Банк", bank.name), detailCard("БИК", bank.bik, bank.bik), detailCard("Корреспондентский счёт", bank.correspondentAccount, bank.correspondentAccount), detailCard("Все банковские реквизиты", "Скопировать одним нажатием", combined, true));
  }

  function renderSchedule() {
    const s = config.schedule; $("#schedule-days").textContent = s.days; $("#open-time").textContent = s.open; $("#close-time").textContent = s.close; $("#schedule-note").textContent = s.note;
    const parts = new Intl.DateTimeFormat("ru-RU", { timeZone: s.timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const time = Number(parts.find(p => p.type === "hour").value) * 60 + Number(parts.find(p => p.type === "minute").value);
    const toMinutes = value => { const [h, m] = value.split(":").map(Number); return h * 60 + m; };
    const open = time >= toMinutes(s.open) && time < toMinutes(s.close), status = $("#open-status"); status.classList.add(open ? "open" : "closed"); status.querySelector("strong").textContent = open ? "Сейчас открыто" : "Сейчас закрыто";
  }

  function renderDocuments() {
    const list = $("#document-list");
    config.documents.forEach(doc => { const card = create("article", "document-card"); card.append(create("span", "doc-symbol", doc.type === "image" ? "▧" : "▤"), create("h3", "", doc.title), create("p", "", doc.available ? (doc.pages ? `${doc.pages} страницы · PDF` : "Оригинал документа") : "Файл ожидает публикации")); const button = create("button", "button", doc.available ? "Открыть документ" : "Пока недоступен"); button.type = "button"; button.disabled = !doc.available; button.addEventListener("click", () => openDocument(doc)); card.append(button); list.append(card); });
  }

  function renderPhones() {
    const addPhones = (items, target) => items.forEach(item => { const link = create("a", "phone-card"); link.href = `tel:${item.tel || item.number}`; link.setAttribute("aria-label", `Позвонить: ${item.name}, ${item.number}`); const text = create("div"); text.append(create("strong", "", item.name), create("span", "", "Нажмите, чтобы позвонить")); link.append(text, create("b", "phone-number", item.number)); target.append(link); });
    addPhones(config.emergencyPhones, $("#emergency-list")); addPhones(config.authorityPhones, $("#authority-list"));
  }

  const modal = $("#document-modal"), modalView = $("#modal-view"), closeButton = $("#modal-close"); let lastFocus;
  function openDocument(doc) { lastFocus = document.activeElement; $("#modal-title").textContent = doc.title; $("#modal-download").href = doc.path; $("#modal-new").href = doc.path; modalView.replaceChildren(); if (doc.type === "image") { const image = new Image(); image.src = doc.path; image.alt = doc.title; modalView.append(image); } else { const frame = create("iframe"); frame.src = doc.path; frame.title = doc.title; modalView.append(frame); } modal.hidden = false; document.body.style.overflow = "hidden"; closeButton.focus(); }
  function closeModal() { modal.hidden = true; modalView.replaceChildren(); document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); }

  function showToast(message) { const toast = $("#toast"); toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200); }
  document.addEventListener("click", async event => { const button = event.target.closest("[data-copy]"); if (!button) return; try { await navigator.clipboard.writeText(button.dataset.copy); showToast("Скопировано"); } catch { const area = create("textarea"); area.value = button.dataset.copy; document.body.append(area); area.select(); document.execCommand("copy"); area.remove(); showToast("Скопировано"); } });
  closeButton.addEventListener("click", closeModal); document.addEventListener("keydown", event => { if (event.key === "Escape" && !modal.hidden) closeModal(); });
  $("#text-size").addEventListener("click", event => { const active = document.body.classList.toggle("large-text"); event.currentTarget.setAttribute("aria-pressed", String(active)); event.currentTarget.setAttribute("aria-label", active ? "Вернуть обычный размер текста" : "Увеличить размер текста"); });
  renderSeller(); renderSchedule(); renderDocuments(); renderPhones();
})();
