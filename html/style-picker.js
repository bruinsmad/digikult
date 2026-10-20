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
      { id: 'space', icon: '🚀', name: hu ? 'Űrárkád' : 'Space Arcade', desc: hu ? 'Neonfények és csillagos ég.' : 'Neon lights under a starry sky.', bg: '#11122d', ink: '#edf3ff', accent: '#75f4df', secondary: '#ff82d5', font: 'ui-monospace, monospace', radius: '12px', border: '2px solid #75f4df', shadow: '0 0 24px #75f4df33', pattern: 'radial-gradient(circle at 12px 12px, #ffffff70 1px, transparent 2px)', size: '48px 48px' },
      { id: 'candy', icon: '🍬', name: hu ? 'Cukorkabolt' : 'Candy Shop', desc: hu ? 'Málnaszín, puha formák, csíkos cukorkák.' : 'Raspberry pink, soft shapes, candy stripes.', bg: '#fff1f6', ink: '#582440', accent: '#aa1754', secondary: '#7650a4', font: '"Trebuchet MS", sans-serif', radius: '28px', border: '3px solid #f4a7c6', shadow: '5px 5px 0 #f4a7c6', pattern: 'repeating-linear-gradient(135deg, transparent 0 24px, #ffd9e8 24px 48px)', size: 'auto' },
      { id: 'forest', icon: '🍄', name: hu ? 'Elvarázsolt erdő' : 'Enchanted Forest', desc: hu ? 'Mohazöld, arany és mesekönyvbetűk.' : 'Mossy greens, gold, and storybook letters.', bg: '#142e26', ink: '#f2f0d8', accent: '#ebce82', secondary: '#b8dfab', font: 'Georgia, serif', radius: '24px 4px 24px 4px', border: '2px solid #779c70', shadow: '5px 5px 0 #0c211a', pattern: 'radial-gradient(ellipse at top left, #38593c, transparent 65%)', size: 'auto' },
      { id: 'ocean', icon: '🐙', name: hu ? 'Óceánkutató' : 'Ocean Explorer', desc: hu ? 'Tengerkék hullámok és korallrészletek.' : 'Sea-blue waves with coral details.', bg: '#e6f8fc', ink: '#123e56', accent: '#075f7c', secondary: '#a43536', font: '"Trebuchet MS", sans-serif', radius: '8px 32px 8px 32px', border: '2px solid #63bfd0', shadow: '5px 5px 0 #9edfe8', pattern: 'radial-gradient(circle at 25px 25px, #ffffff80 9px, transparent 10px)', size: '72px 72px' },
      { id: 'comic', icon: '💥', name: hu ? 'Képregény' : 'Comic Book', desc: hu ? 'Élénk sárga, vastag kontúrok. BUMM!' : 'Bold yellow, chunky outlines. POW!', bg: '#fff5be', ink: '#242136', accent: '#a8213b', secondary: '#254aa5', font: '"Comic Sans MS", "Trebuchet MS", sans-serif', radius: '3px', border: '3px solid #242136', shadow: '6px 6px 0 #242136', pattern: 'radial-gradient(#d9c875 1px, transparent 1px)', size: '10px 10px' },
      { id: 'treasure', icon: '🏴‍☠️', name: hu ? 'Kincses térkép' : 'Treasure Map', desc: hu ? 'Pergamen, tintabarna és titkos ösvények.' : 'Parchment, inky brown, and hidden trails.', bg: '#f5e4bb', ink: '#51341f', accent: '#8b3022', secondary: '#426044', font: 'Georgia, serif', radius: '3px 18px 3px 18px', border: '2px dashed #8b6240', shadow: '5px 5px 0 #cdb17c', pattern: 'radial-gradient(ellipse at center, transparent 40%, #b98c4d66)', size: 'auto' }
    ];
    themes.push(
      { id: 'kitty', icon: '🐱', name: hu ? 'Cicakirályság' : 'Kitty Kingdom', desc: hu ? 'Rózsaszín tappancsok, masnik és dorombolás.' : 'Pink paw prints, bows, and maximum meow.', bg: '#ffe3f0', accent: '#a51763', font: '"Trebuchet MS", sans-serif', radius: '24px', border: '3px solid #dc68a0', pattern: 'radial-gradient(#f5a2cb 3px, transparent 4px)', size: '22px 22px' },
      { id: 'war', icon: '🪖', name: hu ? 'Hadiszállás' : 'War Room', desc: hu ? 'Terepminta, taktikai rács és katonai jelzések.' : 'Camouflage, tactical grids, and military hardware.', bg: '#252c20', accent: '#e3d49a', font: 'ui-monospace, monospace', radius: '0', border: '3px solid #8c9666', pattern: 'repeating-conic-gradient(#35422e 0% 25%, #252c20 0% 50%)', size: '30px 30px' },
      { id: 'cyber', icon: '🌆', name: hu ? 'Neonváros' : 'Cyberpunk City', desc: hu ? 'Elektromos rózsaszín, lézerrács, éjféli város.' : 'Hot pink circuitry and a midnight laser grid.', bg: '#1e1035', accent: '#ff79e5', font: 'ui-monospace, monospace', radius: '2px', border: '2px solid #00efff', pattern: 'linear-gradient(90deg,#00efff33 1px,transparent 1px),linear-gradient(#ff79e533 1px,transparent 1px)', size: '20px 20px' },
      { id: 'vampire', icon: '🦇', name: hu ? 'Vámpírkastély' : 'Vampire Castle', desc: hu ? 'Bársony, vérvörös díszek és denevérek.' : 'Crimson velvet, gothic trim, and resident bats.', bg: '#210f1c', accent: '#ff9cac', font: 'Georgia, serif', radius: '30px 30px 3px 3px', border: '3px double #b55b79', pattern: 'repeating-linear-gradient(90deg,transparent 0 10px,#5c193533 10px 20px)', size: 'auto' },
      { id: 'rainbow', icon: '🦄', name: hu ? 'Szivárványálom' : 'Unicorn Dream', desc: hu ? 'Szivárványok, csillámok, felhők és unikornisok.' : 'Rainbow skies, sparkles, clouds, and unicorns.', bg: '#f6eaff', accent: '#753799', font: '"Trebuchet MS", sans-serif', radius: '24px', border: '3px solid #ba8be0', pattern: 'linear-gradient(135deg,#ffbbdd,#ffebae,#bcf2da,#bfdbff,#e1c1ff)', size: 'auto' },
      { id: 'lava', icon: '🐉', name: hu ? 'Sárkánykohó' : 'Dragon Forge', desc: hu ? 'Izzó láva, vulkáni kőzet és sárkánytűz.' : 'Molten lava, volcanic stone, and dragon fire.', bg: '#281712', accent: '#ffc174', font: 'Georgia, serif', radius: '5px', border: '3px solid #e67d38', pattern: 'repeating-linear-gradient(135deg,#281712 0 15px,#7c321c 16px,#281712 19px)', size: 'auto' }
    );
    const emblems = {
      space: '🪐 ✦ 🚀 ✦ 🛸', candy: '🍭 ✦ 🍬 ✦ 🧁', forest: '🌿 ✦ 🍄 ✦ 🧚',
      ocean: '🪼 ✦ 🐙 ✦ 🐠', comic: '💥 POW! ⚡ BAM! 💥', treasure: '⚓ ✦ 🏴‍☠️ ✦ 🧭',
      kitty: '🐾 🎀 🐱 🎀 🐾', war: '★ ▰ 🪖 ▰ ★', cyber: '◈ ▰ 🌆 ▰ ◈',
      vampire: '🦇 ✦ 🥀 ✦ 🦇', rainbow: '🌈 ✨ 🦄 ✨ 🌈', lava: '🔥 ✦ 🐉 ✦ 🔥'
    };
    const scene = document.createElement('div');
    scene.className = 'theme-scene';
    scene.setAttribute('aria-hidden', 'true');
    document.querySelector('.rail').append(scene);
    const storageKey = 'digikult-editor-theme';
    const valid = id => id === 'none' || themes.some(t => t.id === id);
    const apply = id => {
      if (id === 'none') delete document.documentElement.dataset.editorTheme;
      else document.documentElement.dataset.editorTheme = id;
      const theme = themes.find(t => t.id === id);
      scene.replaceChildren();
      scene.hidden = !theme;
      if (theme) {
        const icons = document.createElement('span'), title = document.createElement('b');
        icons.textContent = emblems[id]; title.textContent = theme.name;
        scene.append(icons, title);
      }
    };
    let selected = 'none';
    try { const saved = localStorage.getItem(storageKey); if (valid(saved)) selected = saved; } catch(e) {}
    apply(selected);
    const dialog = document.createElement('dialog');
    dialog.className = 'style-dialog';
    dialog.setAttribute('aria-labelledby', 'style-title');
    dialog.innerHTML = `<form method="dialog" class="dlg"><div class="style-heading"><span aria-hidden="true">🎨</span><h2 id="style-title" tabindex="-1"></h2></div><p class="style-hint"></p><fieldset class="style-options"><legend class="style-sr"></legend></fieldset><div class="row"><button class="btn ghost" value="cancel" type="submit"></button><button class="btn" value="apply" type="submit"></button></div></form>`;
    dialog.querySelector('h2').textContent = text.title;
    dialog.querySelector('.style-hint').textContent = text.hint;
    dialog.querySelector('legend').textContent = text.label;
    dialog.querySelector('[value="cancel"]').textContent = text.cancel;
    dialog.querySelector('[value="apply"]').textContent = text.apply;
    const options = dialog.querySelector('fieldset');
    for (const t of [...themes, { id: 'none', icon: '✏️', name: text.none, desc: text.noneDesc, bg: '#22362f', ink: '#eef3f1', accent: '#f2d264', font: 'system-ui', radius: '5px', border: '1px solid #aaa', shadow: 'none', pattern: 'none', size: 'auto' }]) {
      const label = document.createElement('label');
      label.className = 'style-option';
      label.dataset.theme = t.id;
      label.innerHTML = `<input type="radio" name="editor-theme" value="${t.id}"><span class="style-swatch" aria-hidden="true"><span>${t.icon}</span><b>Aa</b><i>•••</i></span><span class="style-name"></span><span class="style-desc"></span>`;
      const swatch = label.querySelector('.style-swatch');
      Object.assign(swatch.style, { backgroundColor: t.bg, backgroundImage: t.pattern, backgroundSize: t.size, color: t.accent, fontFamily: t.font, border: t.border, borderRadius: t.radius });
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
