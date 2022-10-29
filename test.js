const zero_cards=[366,380,394,408,422]
const pt = [[252,366,2,3,4,5,6,'a','b'],[32,1,2,380,4,'','','a','c'],[32,1,2,3,408,'','','','a']]
const rs = pt.map(t =>{
    zero_cards.forEach(x => {
      const position =  t.indexOf(x)
      if(position != -1){
        t.splice(position, 1);
        t.splice(6, 0,"");
      }
    })
    return t;
})
console.log(rs)

