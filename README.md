# chrome-gcp-authuser-extension

GCP Authuser Adjusterは、Google Cloud Platform（GCP）コンソールへのリンクをクリックした際に、`authuser`パラメータを自動で調整して、常に正しいアカウントでGCPコンソールを開けるようにするChrome拡張機能です。

https://chromewebstore.google.com/detail/gcp-authuser-adjuster/ipgfckfffpmcpcfjghfdaabfpbpnnjhi

# 主な機能

他人から共有されたURLにアクセスしたときに、別のアカウントでGCPコンソールが開かれることを防ぎ、毎回アカウントを手動で切り替える手間を省きます。
複数のGCPプロジェクトと、それぞれのプロジェクトに対応する`authuser`を簡単に管理できます。

# 利用方法

1. 拡張機能を追加後、ツールバーのアイコンをクリックしてポップアップを開いてください。
2. 使用するプロジェクトIDと対応する`authuser`を入力します。
3. リストに追加された設定を確認し、保存されているか確認できます。
4. 以降、GCPコンソールへのリンクをクリックすると、設定した`authuser`で自動的に開かれます。
