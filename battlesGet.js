const fetch = require("node-fetch");
const fs = require('fs');


const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

const {  sleep } = require('./helper');


async function getBattleHistory(player = '', data = {}) {
    const battleHistory = await fetch('https://api.steemmonsters.io/battle/history?player=' + player.toLocaleLowerCase())
        .then((response) => {
            if (!response.ok) {
                console.log('Network response was not ok');
                return {'battles':[]}
            }
            return response;
        })
        .then((battleHistory) => {
            return battleHistory.json();
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    return battleHistory.battles;
}

const extractMonster = (team) => {
    const monster1 = team.monsters[0];
    const monster2 = team.monsters[1];
    const monster3 = team.monsters[2];
    const monster4 = team.monsters[3];
    const monster5 = team.monsters[4];
    const monster6 = team.monsters[5];

    return {
        summoner_id: team.summoner.card_detail_id,
        summoner_level: team.summoner.level,
        monster_1_id: monster1 ? monster1.card_detail_id : '',
        monster_1_level: monster1 ? monster1.level : '',
        monster_1_abilities: monster1 ? monster1.abilities : '',
        monster_2_id: monster2 ? monster2.card_detail_id : '',
        monster_2_level: monster2 ? monster2.level : '',
        monster_2_abilities: monster2 ? monster2.abilities : '',
        monster_3_id: monster3 ? monster3.card_detail_id : '',
        monster_3_level: monster3 ? monster3.level : '',
        monster_3_abilities: monster3 ? monster3.abilities : '',
        monster_4_id: monster4 ? monster4.card_detail_id : '',
        monster_4_level: monster4 ? monster4.level : '',
        monster_4_abilities: monster4 ? monster4.abilities : '',
        monster_5_id: monster5 ? monster5.card_detail_id : '',
        monster_5_level: monster5 ? monster5.level : '',
        monster_5_abilities: monster5 ? monster5.abilities : '',
        monster_6_id: monster6 ? monster6.card_detail_id : '',
        monster_6_level: monster6 ? monster6.level : '',
        monster_6_abilities: monster6 ? monster6.abilities : ''
    };
};

const extractGeneralInfo = (x) => {
    return {
        created_date: x.created_date ? x.created_date : '',
        match_type: x.match_type ? x.match_type : '',
        mana_cap: x.mana_cap ? x.mana_cap : '',
        ruleset: x.ruleset ? x.ruleset : '',
        inactive: x.inactive ? x.inactive : ''
    };
};


async function getBattleDetail(player = '') {
    return  await getBattleHistory(player).then(battles => battles.map(
        x => {
            // console.log(x)
            const details = JSON.parse(x.details);
            if (details.type != 'Surrender') {
                const monstersDetails = extractMonster(player.toLocaleLowerCase() == x.player_1.toLocaleLowerCase() ?  details.team1 : details.team2);
                const info = extractGeneralInfo(x);
                return {
                    ...monstersDetails,
                    ...info,
                    isWin: x.winner == player ? true : false
                }
            } else {
                return []
            }
        })
    )
}

users = [];
player = 'nckistaightt'
// const battles = getBattleHistory(player)
//     .then(battles => battles.map(
//         x => {
//             console.log(x)
//             const details = JSON.parse(x.details);
//             return {
//                 battle_queue_id_1: x.battle_queue_id_1,
//                 battle_queue_id_2: x.battle_queue_id_2,
//                 player_1_rating_initial: x.player_1_rating_initial,
//                 player_2_rating_initial: x.player_2_rating_initial,
//                 winner: x.winner,
//                 player_1_rating_final: x.player_1_rating_final,
//                 player_2_rating_final: x.player_2_rating_final,
//                 player_1: x.player_1,
//                 player_2: x.player_2,
//                 created_date: x.created_date,
//                 match_type: x.match_type,
//                 mana_cap: x.mana_cap,
//                 current_streak: x.current_streak,
//                 ruleset: x.ruleset,
//                 inactive: x.inactive,
//                 settings: x.settings,
//                 block_num: x.block_num,
//                 rshares: x.rshares,
//                 dec_info: x.dec_info,
//                 details_team1: details.team1,
//                 details_team2: details.team2,
//                 details_prebattle: details.prebattle
//             }
//         })
//     ).then(
//         x => {
//             fs.writeFile(`data/${player}_Raw.json`, JSON.stringify(x), function (err) {
//                 if (err) {
//                     console.log(err);
//                 }
//             });
//             x.map(element => {
//                 users.push(element.player_2);
//                 users.push(element.player_1);
//             }
//             );
//             // console.log(users.filter(distinct))
//         }
//     )


module.exports.getBattleHistory = getBattleHistory;
module.exports.getBattleDetail = getBattleDetail