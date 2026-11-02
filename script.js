// Replace these placeholder URLs with the community's real invite and service links.
const LINKS = {
  discord: "https://discord.gg/bullshitprojectdbdm",
  appeals: "https://discord.gg/rPTGXgVXKD",
  kofi: "https://ko-fi.com/turbodarkow",
  telegram: "https://t.me/bsprojapp"
};

document.getElementById("discordLink").href = LINKS.discord;
const appealsLink = document.getElementById("appealsLink");
if (LINKS.appeals) appealsLink.href = LINKS.appeals;

document.querySelectorAll("[data-placeholder]").forEach(link => {
  const key = link.dataset.placeholder;
  if (LINKS[key]) {
    link.href = LINKS[key];
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = link.textContent.replace("ADD ", "OPEN ").replace(" LINK", "");
  } else {
    link.addEventListener("click", event => {
      event.preventDefault();
      alert("This link has not been configured yet. Add the real URL in script.js.");
    });
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "✕" : "☰";
});
nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.textContent = "☰";
}));

// Character directory: cards open an accessible, searchable profile modal.
(() => {
  const data = window.DBD_CHARACTERS;
  if (!data) return;
  const grid = document.getElementById('characterGrid');
  const search = document.getElementById('characterSearch');
  const tabs = [...document.querySelectorAll('.directory-tab')];
  const modal = document.getElementById('characterModal');
  let activeType = 'survivors';
  let lastFocused = null;

  document.getElementById('survivorCount').textContent = `(${data.survivors.length})`;
  document.getElementById('killerCount').textContent = `(${data.killers.length})`;

  const imageSlug = name => name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const imageUrl = name => `https://deadbydaylight.fandom.com/wiki/Special:FilePath/${encodeURIComponent('CharPortrait_' + imageSlug(name) + '.png')}?width=520`;
  const mobileSkinUrl = filename => `https://deadbydaylight.fandom.com/wiki/Special:FilePath/${encodeURIComponent(filename)}`;
  const fallbackArt = (name, role) => {
    const initials = name.replace(/^The /,'').split(/\s+/).slice(0,2).map(part => part[0]).join('').toUpperCase();
    const label = role === 'survivor' ? 'SURVIVOR ARCHIVE' : 'KILLER ARCHIVE';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="760" viewBox="0 0 600 760"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#64252d"/><stop offset="1" stop-color="#101014"/></linearGradient><radialGradient id="r"><stop stop-color="#b33a42" stop-opacity=".55"/><stop offset="1" stop-color="#111" stop-opacity="0"/></radialGradient></defs><rect width="600" height="760" fill="url(#g)"/><rect width="600" height="760" fill="url(#r)"/><path d="M70 760 Q100 420 300 390 Q500 420 530 760" fill="#09090d" opacity=".75"/><text x="300" y="350" text-anchor="middle" fill="#fff" opacity=".9" font-family="Arial,sans-serif" font-size="150" font-weight="900">${initials}</text><text x="300" y="680" text-anchor="middle" fill="#f0787c" font-family="Arial,sans-serif" font-size="22" letter-spacing="6">${label}</text><text x="300" y="720" text-anchor="middle" fill="#fff" opacity=".7" font-family="Arial,sans-serif" font-size="17">${name.replace(/[&<>"]/g, '')}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function render() {
    const query = search.value.trim().toLowerCase();
    const list = data[activeType].filter(item => item.join(' ').toLowerCase().includes(query));
    grid.innerHTML = list.length ? list.map((item, index) => {
      const name = activeType === 'survivors' ? item[0] : item[0];
      const alias = activeType === 'survivors' ? item[3] : item[1];
      const portraitName = activeType === 'survivors' ? name : name;
      const initials = name.replace(/^The /,'').split(/\s+/).slice(0,2).map(part => part[0]).join('');
      return `<button class="character-card" type="button" data-index="${data[activeType].indexOf(item)}" aria-label="Open ${escapeHtml(name)} profile">
        <div class="character-art"><span class="character-monogram">${escapeHtml(initials)}</span><img loading="lazy" src="${imageUrl(portraitName)}" alt="${escapeHtml(name)} character portrait" onerror="this.onerror=null;this.src='${fallbackArt(name, activeType === 'survivors' ? 'survivor' : 'killer')}'"></div>
        <div class="character-card-copy"><small>${activeType === 'survivors' ? 'SURVIVOR' : 'KILLER'} · ${escapeHtml(activeType === 'survivors' ? item[1] : item[2])} DIFFICULTY</small><strong>${escapeHtml(name)}</strong><span>${escapeHtml(alias)}</span></div>
      </button>`;
    }).join('') : '<div class="directory-empty">No characters match that search. Try another name, perk, or ability.</div>';
    grid.querySelectorAll('.character-card').forEach(card => card.addEventListener('click', () => openProfile(data[activeType][Number(card.dataset.index)])));
  }

  function openProfile(item) {
    lastFocused = document.activeElement;
    const isSurvivor = activeType === 'survivors';
    const name = item[0];
    const alias = isSurvivor ? item[3] : item[1];
    const difficulty = isSurvivor ? item[1] : item[2];
    const abilityName = isSurvivor ? 'PLAYSTYLE & PERK OVERVIEW' : `POWER · ${item[3]}`;
    const ability = isSurvivor ? item[5] : item[5];
    const perks = isSurvivor ? item[2] : item[6];
    const origin = isSurvivor ? item[6] : item[7];
    const portrait = imageUrl(name);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.querySelector('.modal-panel').classList.toggle('killer', !isSurvivor);
    document.getElementById('modalRole').textContent = isSurvivor ? 'SURVIVOR PROFILE' : 'KILLER PROFILE';
    document.getElementById('modalSubtitle').textContent = isSurvivor ? 'THE ONES WHO FIGHT TO ESCAPE' : 'THE ONES WHO HUNT IN THE FOG';
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalAlias').textContent = alias;
    document.getElementById('modalMeta').innerHTML = `<span>${isSurvivor ? 'SURVIVOR' : 'KILLER'}</span><span>${escapeHtml(difficulty)} DIFFICULTY</span><span>${escapeHtml(origin)}</span>`;
    document.getElementById('modalBio').textContent = isSurvivor ? item[4] : `${item[1]} · ${item[4]}`;
    document.getElementById('abilityHeading').textContent = abilityName;
    document.getElementById('modalAbility').textContent = ability;
    document.getElementById('perkHeading').textContent = isSurvivor ? 'UNIQUE PERKS' : 'TEACHABLE PERKS';
    document.getElementById('modalPerks').innerHTML = perks.split(' · ').map(perk => `<span>${escapeHtml(perk)}</span>`).join('');
    document.getElementById('modalOrigin').textContent = `ORIGIN / LICENSE: ${origin} · Character descriptions are concise fan-reference summaries.`;
    renderSkinGallery(name, isSurvivor);
    const portraitPanel = document.getElementById('modalPortrait');
    portraitPanel.style.backgroundImage = `linear-gradient(0deg,#09090d66,#09090d22),url("${portrait}")`;
    portraitPanel.style.backgroundSize = 'cover';
    portraitPanel.style.backgroundPosition = 'center 25%';
    document.querySelector('.modal-close').focus();
  }


  // The supplied project contains a character roster, but no verified Mobile
  // cosmetics catalogue. Never substitute PC/console cosmetics or invent LIMITED
  // status. The base appearance is shown as a clearly identified reference entry.
  function renderSkinGallery(characterName, isSurvivor) {
    const region = document.getElementById('skinRegion').value;
    const gallery = document.getElementById('skinGallery');
    const portrait = imageUrl(characterName);
    const role = isSurvivor ? 'survivor' : 'killer';
    const fallback = fallbackArt(characterName, role);
    const regionLabel = region === 'both' ? 'GLOBAL + ASIAN REFERENCE' : region.toUpperCase() + ' VERSION';
    const isOni = characterName === 'The Oni' && !isSurvivor;
    const skinImage = isOni ? mobileSkinUrl('SwedenKiller outfit 019.png') : portrait;
    const skinTitle = isOni ? 'Mountain Hunt' : 'Default Outfit';
    const skinDescription = isOni ? 'A Dead by Daylight Mobile-exclusive Days Gone By collection outfit. The Oni hunted bandits through the mountains.' : 'Standard character appearance reference. Mobile-specific alternate outfit records are not yet verified for this character.';
    gallery.innerHTML = `<article class="skin-card">
      <div class="skin-card-image"><img src="${skinImage}" alt="${escapeHtml(characterName)} ${escapeHtml(skinTitle)} image" loading="lazy" onerror="this.onerror=null;this.src='${fallback}'"><span class="skin-status status-standard">NOT LIMITED</span></div>
      <div class="skin-card-copy"><small>${isOni ? 'MOBILE EXCLUSIVE · DAYS GONE BY · ' : 'CHARACTER REFERENCE · '}${regionLabel}</small><strong>${skinTitle}</strong><p>${skinDescription}</p></div>
    </article>
    <p class="skin-data-notice">Character portraits load from the Dead by Daylight image archive, with a built-in visual fallback if an image host is unavailable. Only the Mountain Hunt outfit is currently included as a verified Mobile-exclusive skin image; other entries remain character references until their Global/Asian Mobile outfit images and availability are verified.</p>`;
  }

  document.getElementById('skinRegion').addEventListener('change', () => {
    const name = document.getElementById('modalName').textContent;
    if (name) renderSkinGallery(name, activeType === 'survivors');
  });

  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    activeType = tab.dataset.type;
    tabs.forEach(button => {
      const selected = button === tab;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-selected', String(selected));
    });
    render();
  }));
  search.addEventListener('input', render);
  modal.querySelectorAll('[data-close-modal]').forEach(element => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
  // Separate searchable Mobile perk and item reference.
  const resourceGrid = document.getElementById('resourceGrid');
  const resourceSearch = document.getElementById('resourceSearch');
  const resourceTabs = [...document.querySelectorAll('.resource-tab')];
  let activeResource = 'survivor-perks';
  const itemRecords = [
    {name:'Med-Kit',kind:'HEALING ITEM',desc:'Used to heal injured Survivors. Depending on the kit and add-ons, it can improve healing speed or provide limited self-healing.',icon:'✚'},
    {name:'Toolbox',kind:'REPAIR & SABOTAGE',desc:'A tool set used to speed up Generator repairs and, where supported, sabotage Hooks. Different toolbox variants have different charge capacities.',icon:'⚒'},
    {name:'Flashlight',kind:'BLINDING ITEM',desc:'Shines a beam that can temporarily blind the Killer. A well-timed flashlight save can free a carried Survivor.',icon:'☼'},
    {name:'Map',kind:'TRACKING ITEM',desc:'Helps track important objects and locations during a Trial. Map variants and add-ons affect what can be tracked.',icon:'▤'},
    {name:'Key',kind:'UTILITY ITEM',desc:'A special item with variants and add-ons that can provide aura-reading utility. Its functions depend on the key type and equipped add-ons.',icon:'⚿'},
    {name:'Firecracker',kind:'EVENT ITEM',desc:'A consumable event item that creates a loud flash and bang. It can distract or briefly blind the Killer when timed correctly.',icon:'✦'}
  ];
  function resourceCard(title, category, desc, owner='') {
    return `<article class="resource-card"><small>${escapeHtml(category)}</small><h3>${escapeHtml(title)}</h3><p>${escapeHtml(desc)}</p>${owner ? `<span class="resource-owner">CHARACTER: ${escapeHtml(owner)}</span>` : ''}</article>`;
  }
  function renderResources() {
    const q = resourceSearch.value.trim().toLowerCase();
    let cards = [];
    if (activeResource === 'items') {
      cards = itemRecords.filter(x => `${x.name} ${x.kind} ${x.desc}`.toLowerCase().includes(q)).map(x => `<article class="resource-card item-card"><div class="resource-item-art"><span aria-hidden="true">${x.icon}</span></div><div><small>${escapeHtml(x.kind)}</small><h3>${escapeHtml(x.name)}</h3><p>${escapeHtml(x.desc)}</p></div></article>`);
    } else {
      const isSurvivor = activeResource === 'survivor-perks';
      const source = isSurvivor ? data.survivors : data.killers;
      const seen = new Set();
      source.forEach(person => {
        const owner = person[0];
        const perksText = isSurvivor ? person[2] : person[6];
        String(perksText || '').split(' · ').forEach(perk => {
          const key = perk.trim().toLowerCase();
          if (!key || seen.has(key)) return;
          seen.add(key);
          if (`${perk} ${owner}`.toLowerCase().includes(q)) cards.push(resourceCard(perk, isSurvivor ? 'SURVIVOR PERK' : 'KILLER PERK', `Unique perk associated with ${owner}. Open the character profile for the available Mobile perk overview.`, owner));
        });
      });
    }
    resourceGrid.innerHTML = cards.length ? cards.join('') : '<div class="resource-empty">No results found. Try another search.</div>';
  }
  resourceTabs.forEach(tab => tab.addEventListener('click', () => {
    activeResource = tab.dataset.resource;
    resourceTabs.forEach(button => button.classList.toggle('active', button === tab));
    resourceSearch.value = '';
    renderResources();
  }));
  resourceSearch.addEventListener('input', renderResources);
  renderResources();

  render();
})();
