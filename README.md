# scraping_recommentRank

GAS(Google Apps Script)で、Webスクレイピング（実際はWebサイトから取得したコンテンツを保存したテキストファイル）を行い、結果をGoogle スプレッドシートに書き出すものです。

## 実行

下記の準備を行います。

Apps Scriptのプロジェクトを開き、実行する関数から「main」を選択して実行します

（初回は権限確認のモーダルが表示されますので許可してください）

実行後、スプレッドシートの「キャラ推奨ランクマスタ」にキャラ名／ランク／装備状態が書き込まれます。

## 準備

### コンテンツを保存したテキストファイル（148926.txt）の作成方法
 
PowerShellで「getContents.ps1」を実行してください。

作成された「148926.txt」をGoogle Driveに配置します。
  
### Google スプレッドシートの作成とシートIDの取得（最初のみ）

Google スプレッドシートに任意のスプレッドシートを作成し、シート名は「キャラ推奨ランクマスタ」に変えます。

アドレスバーにある「<span>https<span>://docs.google.com/spreadsheets/d/hgehoge/edit#gid=0」から hogehoge の値（以降、シートID）を控えます。
  
「myToken.json」を開き、控えたシートIDを packages.priconeCharRank.sheetId に転記します。
  
「myToken.json」をGoogle Driveに配置します。

### Apps Script（初回のみ）

Apps Scriptのプロジェクトを作成し、「mainLogic.gs」の内容を貼り付けます。
  
ライブラリにParserを追加します（[追加方法](https://auto-worker.com/blog/?p=2460)）
