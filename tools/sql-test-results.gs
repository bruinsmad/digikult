/**
 * SQL témazáró – eredmények gyűjtése egy Google-táblázatba.
 *
 * Telepítés (egyszer):
 *  1. Hozz létre egy új Google-táblázatot (pl. „SQL témazáró – eredmények”).
 *  2. Bővítmények → Apps Script. Töröld ki, ami ott van, és illeszd be ezt a teljes fájlt. Mentés.
 *  3. Telepítés → Új telepítés → fogaskerék → Webalkalmazás.
 *       Végrehajtás mint:  Én
 *       Hozzáférés:        Bárki
 *     Telepítés → engedélyezd a hozzáférést a saját fiókoddal.
 *  4. Másold ki a webalkalmazás URL-jét (…/exec), és küldd el, hogy bekerüljön a dolgozatba.
 *
 * Minden beadás egy új sor az „SQL témazáró” lapon: név, nyelv, pontszám, idő, kérdésenként a pont és a válasz.
 * Ha ugyanaz a beadás kétszer érkezik (újraküldés), csak egyszer kerül be.
 */

const SHEET_NAME = "SQL témazáró";
const SEND_KEY = "digikult-sql-test";   // ugyanaz, mint a dolgozat oldalán: a véletlen, idegen kéréseket kiszűri

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const d = JSON.parse(e.postData.contents);
    if (!d || d.key !== SEND_KEY || d.test !== "sql-test" || !Array.isArray(d.items) || d.items.length > 100) return reply({ ok: false });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    const header = ["Beadva", "Név", "Nyelv", "Pont", "Max", "%", "Idő"]
      .concat(d.items.map(i => i.no + ". pont"))
      .concat(d.items.map(i => i.no + ". válasz"))
      .concat(["Azonosító"]);

    if (sh.getLastRow() === 0) {
      sh.appendRow(header);
      sh.setFrozenRows(1);
      sh.setFrozenColumns(2);
      sh.getRange(1, 1, 1, header.length).setFontWeight("bold").setBackground("#efe9d6");
    }

    // the same hand-in sent twice (e.g. "Send again") is stored once
    const id = clip(d.name, 80) + " | " + clip(d.submittedAt, 40);
    const idCol = header.length;
    if (sh.getLastRow() > 1) {
      const found = sh.getRange(2, idCol, sh.getLastRow() - 1, 1).createTextFinder(id).matchEntireCell(true).findNext();
      if (found) return reply({ ok: true, duplicate: true });
    }

    const row = [new Date(d.submittedAt || Date.now()), clip(d.name, 80), clip(d.lang, 5), num(d.score), num(d.max),
                 d.max ? num(d.score) / num(d.max) : 0, clip(d.timeUsed, 12)]
      .concat(d.items.map(i => num(i.pts)))
      .concat(d.items.map(i => clip(i.answer, 3000)))
      .concat([id]);
    sh.appendRow(row);
    const r = sh.getLastRow();
    sh.getRange(r, 1).setNumberFormat("yyyy.mm.dd hh:mm");
    sh.getRange(r, 6).setNumberFormat("0%");
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// opening the URL in a browser shows that the web app is running
function doGet() {
  return reply({ ok: true, msg: "Az SQL témazáró eredménygyűjtője működik." });
}

function reply(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// text from the page: never a formula, never too long
function clip(s, n) {
  s = String(s == null ? "" : s);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s.slice(0, n);
}

function num(x) {
  const v = Number(x);
  return isFinite(v) ? v : 0;
}
