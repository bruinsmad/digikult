/* Shared editor-interface theme picker for the English and Hungarian HTML editors. */
window.DKStylePicker = {
  mount({ button, lang }) {
    const hu = lang === 'hu';
    const text = hu ? {
      title: 'Válassz egy világot!', hint: 'Színek és hangulat a szerkesztődhöz.',
      apply: 'Stílus alkalmazása', cancel: 'Mégse', none: 'Klasszikus tábla', noneDesc: 'Az eredeti zöld szerkesztő.',
      label: 'Szerkesztőstílusok'
    } : {
      title: 'Pick your world!', hint: 'Give your editor a new look and feel.',
      apply: 'Apply style', cancel: 'Cancel', none: 'Classic Chalkboard', noneDesc: 'The original green editor.',
      label: 'Editor themes'
    };
    const themes = [
      { id: 'space', name: hu ? 'Űrárkád' : 'Space Arcade', desc: hu ? 'Neonfények és csillagos ég.' : 'Neon lights under a starry sky.', accent: '#9cc8e8', code: '#1d2830' },
      { id: 'candy', name: hu ? 'Cukorkabolt' : 'Candy Shop', desc: hu ? 'Málnaszín, puha formák, csíkos cukorkák.' : 'Raspberry pink, soft shapes, candy stripes.', accent: '#f0a3b8', code: '#2b252c' },
      { id: 'forest', name: hu ? 'Elvarázsolt erdő' : 'Enchanted Forest', desc: hu ? 'Mohazöld, arany és mesekönyvbetűk.' : 'Mossy greens, gold, and storybook letters.', accent: '#a8dba0', code: '#1f2a26' },
      { id: 'ocean', name: hu ? 'Óceánkutató' : 'Ocean Explorer', desc: hu ? 'Tengerkék hullámok és korallrészletek.' : 'Sea-blue waves with coral details.', accent: '#9cc8e8', code: '#1d2b30' },
      { id: 'comic', name: hu ? 'Képregény' : 'Comic Book', desc: hu ? 'Élénk sárga, vastag kontúrok. BUMM!' : 'Bold yellow, chunky outlines. POW!', accent: '#f2d264', code: '#24282c' },
      { id: 'treasure', name: hu ? 'Kincses térkép' : 'Treasure Map', desc: hu ? 'Pergamen, tintabarna és titkos ösvények.' : 'Parchment, inky brown, and hidden trails.', accent: '#f2d264', code: '#2b2821' },
      { id: 'kitty', name: hu ? 'Cicakirályság' : 'Kitty Kingdom', desc: hu ? 'Rózsaszín tappancsok, masnik és dorombolás.' : 'Pink paw prints, bows, and maximum meow.', accent: '#f0a3b8', code: '#2b252c' },
      { id: 'war', name: hu ? 'Hadiszállás' : 'War Room', desc: hu ? 'Terepminta, taktikai rács és katonai jelzések.' : 'Camouflage, tactical grids, and military hardware.', accent: '#b9cb9a', code: '#242b23' },
      { id: 'cyber', name: hu ? 'Neonváros' : 'Cyberpunk City', desc: hu ? 'Elektromos rózsaszín, lézerrács, éjféli város.' : 'Hot pink circuitry and a midnight laser grid.', accent: '#c3b1e1', code: '#252632' },
      { id: 'vampire', name: hu ? 'Vámpírkastély' : 'Vampire Castle', desc: hu ? 'Bársony, vérvörös díszek és denevérek.' : 'Crimson velvet, gothic trim, and resident bats.', accent: '#e5a1b7', code: '#2c242b' },
      { id: 'rainbow', name: hu ? 'Szivárványálom' : 'Unicorn Dream', desc: hu ? 'Szivárványok, csillámok, felhők és unikornisok.' : 'Rainbow skies, sparkles, clouds, and unicorns.', accent: '#c3b1e1', code: '#272730' },
      { id: 'lava', name: hu ? 'Sárkánykohó' : 'Dragon Forge', desc: hu ? 'Izzó láva, vulkáni kőzet és sárkánytűz.' : 'Molten lava, volcanic stone, and dragon fire.', accent: '#f0b079', code: '#2d2723' }
    ];
    const scene = document.createElement('div');
    scene.className = 'theme-scene';
    scene.setAttribute('aria-hidden', 'true');
    document.querySelector('#work').append(scene);
    const storageKey = 'digikult-editor-theme';
    const valid = id => id === 'none' || themes.some(t => t.id === id);
    const apply = id => {
      const root = document.documentElement, theme = themes.find(t => t.id === id);
      scene.replaceChildren();
      scene.hidden = !theme;
      if (!theme) {
        delete root.dataset.editorTheme;
        root.style.removeProperty('--theme-accent');
        root.style.removeProperty('--theme-code-bg');
        return;
      }
      root.dataset.editorTheme = id;
      root.style.setProperty('--theme-accent', theme.accent);
      root.style.setProperty('--theme-code-bg', theme.code);
      const title = document.createElement('b'), art = document.createElement('img');
      title.className = 'theme-title'; title.textContent = theme.name;
      art.className = 'theme-doodle'; art.src = `theme-art/${id}.svg`; art.alt = '';
      art.width = 240; art.height = 140; art.draggable = false;
      scene.append(title, art);
    };
    let selected = 'none';
    try { const saved = localStorage.getItem(storageKey); if (valid(saved)) selected = saved; } catch(e) {}
    apply(selected);
    const dialog = document.createElement('dialog');
    dialog.className = 'style-dialog';
    dialog.setAttribute('aria-labelledby', 'style-title');
    dialog.innerHTML = `<form method="dialog" class="dlg"><div class="style-heading"><h2 id="style-title" tabindex="-1"></h2></div><p class="style-hint"></p><fieldset class="style-options"><legend class="style-sr"></legend></fieldset><div class="row"><button class="btn ghost" value="cancel" type="submit"></button><button class="btn" value="apply" type="submit"></button></div></form>`;
    dialog.querySelector('h2').textContent = text.title;
    dialog.querySelector('.style-hint').textContent = text.hint;
    dialog.querySelector('legend').textContent = text.label;
    dialog.querySelector('[value="cancel"]').textContent = text.cancel;
    dialog.querySelector('[value="apply"]').textContent = text.apply;
    const options = dialog.querySelector('fieldset');
    for (const t of [...themes, { id: 'none', name: text.none, desc: text.noneDesc }]) {
      const label = document.createElement('label');
      label.className = 'style-option';
      label.dataset.theme = t.id;
      label.innerHTML = `<input type="radio" name="editor-theme" value="${t.id}"><span class="style-swatch" aria-hidden="true"><img src="theme-art/${t.id}.svg" alt="" width="240" height="140" loading="lazy"></span><span class="style-name"></span><span class="style-desc"></span>`;
      label.style.setProperty('--swatch-accent', t.accent || '#f2d264');
      label.querySelector('.style-name').textContent = t.name;
      label.querySelector('.style-desc').textContent = t.desc;
      options.append(label);
    }
    document.body.append(dialog);
    button.onclick = () => {
      dialog.querySelector(`input[value="${selected}"]`).checked = true;
      dialog.returnValue = '';
      dialog.showModal();
      dialog.querySelector('h2').focus({ preventScroll: true });
      dialog.scrollTop = 0;
    };
    dialog.addEventListener('close', () => {
      if (dialog.returnValue !== 'apply') return;
      selected = dialog.querySelector('input:checked').value;
      apply(selected);
      try { localStorage.setItem(storageKey, selected); } catch(e) {}
      button.focus();
    });
  }
};
