// Webページから対象のTable要素の中身を取得する。
function getTableContents() {
    // 148926.txt の内容は powershell で以下のコマンドを入力する。
    // (curl https://gamewith.jp/pricone-re/article/show/148926).Content | Out-File -Encoding utf8 148926.txt
    // 出来上がった「148926.txt」をGoogleドライブに保存しておく。
    let file = DriveApp.getFilesByName('148926.txt').next();
    let textData = file.getBlob().getDataAsString('utf8');

    // 1. データ追加部分の箇所を切り出す
    let pastDateArea = Parser.data(textData)
      .from('<!-- ↓ データ貼り付けここから ↓ -->')
      .to('<!-- ↑ データ貼り付けここまで ↑ -->')
      .build();

    // 2. テーブル要素の中身を取得する
    return Parser.data(textData)
      .from('<div class="puri_5col-table"><table>')
      .to('</table></div>')
      .build();
}


// キャラ情報をスプレッドシートに出力する
function writeSpredSheet( chars ) {
  // 設定情報を格納したJSONをGoogle Driveから取得する
  // 設定情報からシートidを取得する。
  let file = DriveApp.getFilesByName('myToken.json').next();
  let jsonData = JSON.parse( file.getBlob().getDataAsString('utf8') );

  // スプレッドシートのidを指定してスプレッドシートを開く。
  // 具体的な「sheetId」の値は、Google スプレッドシートを開き、
  // https://docs.google.com/spreadsheets/d/[***********]/edit#gid=0 の [***********] をmyToken.jsonにセットしておく
  const myBook = SpreadsheetApp.openById( jsonData.packages.priconeCharRank.sheetId );
  const mySheet = myBook.getSheetByName("キャラ推奨ランクマスタ");

  // 全部消す
  mySheet.getRange(1, 1, mySheet.getLastRow(), 3 ).clear();

  // ヘッダを書く
  mySheet.getRange( 1, 1, 1, 3 ).setValues( [["キャラ名", "ランク", "装備状態"]] );

  // １名ずつ名乗りを上げる
  for( i = 0; i < chars.length; i++ ) {
    const char1 = chars[i];
    mySheet.getRange( (i+2), 1, 1, 3 ).setValues( [[char1.name, char1.rank, char1.equipment]] );
  }
}


// キャラクター名を本来の形に整える
function cleaningCharcterNames( charcterNames ) {

  for( let i = 0; i < charcterNames.length; i++ ) {
    let result = charcterNames[i];

    // 1.&amp; -> ＆
    result = result.replaceAll('&amp;','＆');

    if ( /^水着(.+)$/.test(result) ) {
      // 2.水着＊＊＊ -> ＊＊＊(サマー)
      result = result.replace(/^水着(.+)$/, '$1(サマー)');
    }
    else if ( /^正月(.+)$/.test(result) ) {
      // 3.正月＊＊＊ -> ＊＊＊(ニューイヤー)
      result = result.replace(/^正月(.+)$/, '$1(ニューイヤー)');
    }

    charcterNames.splice(i, 1, result);
  }

  return charcterNames;
}


// 解析 
function parseCharsInTrs( rows ) {

  // キャラクターに紐づけるランクと装備条件の状態
  let rankStatus = {
    rank: undefined,
    equipment: undefined,
  };

  let chars = [];

  rows.forEach( x1 => {
    // [">]を排除
    const trContent = x1.slice( x1.indexOf('">') + 2 );

    // ランクと装備条件？？？
    if ( /^<th colspan="5">/.test(trContent) ) {
      let rankContent = Parser.data(trContent).from('<th colspan="5">').to('</th>').build();

      // ランクと装備条件が入っていなかったら排除
      if ( !/ランク\d+\(.+\)$/.test(rankContent) ) {
        return;
      }

      // ランクと装備条件に分解する
      const rest = /ランク(\d+)\((.+)\)$/.exec(rankContent);

      rankStatus.rank = rest[1];
      rankStatus.equipment = rest[2];
    
      return;
    }

    // [該当キャラなし]は排除
    if ( /該当キャラなし/.test(trContent) ) {
      return;
    }

    // 1. キャラクターを１人／行で抜き取る
    // 2. キャラクターを正しい形に直す
    // 3. １行ずつ結果配列に格納する
    cleaningCharcterNames(
        Parser.data(trContent).from("</noscript>").to("</a>").iterate()
      ).forEach( x2 => {
        chars.push( {
          name: x2,
          rank: rankStatus.rank,
          equipment: rankStatus.equipment,
        } );
      } );

  });

  return chars;
}


// 外部Webサイト（キャラ推奨ランク）のテキストから 
// キャラ名／ランク／装備状態 をスクレイピングして、Google SpreadSheetに書き込む
function main() {
  try {
    // tr要素単位で１行ずつ分解する
    let rows = Parser.data( getTableContents() )
      .from('<tr class="w-idb-element" ')
      .to('</tr>')
      .iterate();

    // テーブルの内容からキャラ名／ランク／装備状態の行として解析する
    let chars = parseCharsInTrs( rows );

    // スプレッドシートに書き出す
    writeSpredSheet( chars )

    Logger.log('Done:' + chars.length + '名')

  } catch(e) {
    Logger.log('Error:')
    Logger.log(e)
  }
}
