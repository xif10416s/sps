function getPowerMarker (current,targetPower , nextTargetPower){
  const delterTarget = targetPower/1000 - current/1000
  const delterNextTarget = nextTargetPower/1000 - current/1000
  if(delterTarget > 0 ){
    return -delterTarget + "k↓";
  } else {
    if(delterNextTarget >0 ){
      return -delterTarget + "k-";
    } else {
      return -delterNextTarget + "k↑";
    }
  }
}

console.log(getPowerMarker(500,1000,1500))
console.log(getPowerMarker(9000,7500,15000))
console.log(getPowerMarker(30000,7500,15000))