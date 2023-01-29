function Main() {
  doOpen("xifei1234")
}

function doOpen(name){
  xsh.Session.Open("ssh://xifei:xifei@127.0.0.1")
  xsh.Session.TabText = "alg"
  xsh.Session.Sleep(1000)
  xsh.Screen.Send("cd /mnt/d/source/python/spsAuto/splinterlands-bot/logs && watch -n 5  tail -n15  ---disable-inotify  SummaryWin.txt")
  xsh.Screen.Send(String.fromCharCode(13))
}