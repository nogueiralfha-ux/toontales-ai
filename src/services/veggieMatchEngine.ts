import { Match, MatchEvent, Character, Club } from '../domain/veggieTypes';
import { VeggieDatabase } from './veggieDatabase';

export type UserAction = 'ATTACK' | 'PASS' | 'DRIBBLE' | 'SHOOT' | 'DEFEND' | 'COUNTER_ATTACK' | 'SPECIAL_SKILL';

export class VeggieMatchEngine {
  
  static generateMatchIntro(homeClub: Club, awayClub: Club): MatchEvent[] {
    return [
      { minute: 0, type: 'START', description: `Bem-vindo à Veggie Arena! Mais de 75.000 torcedores lotam as arquibancadas com bandeiras e faixas!` },
      { minute: 0, type: 'INFO', description: `Os times entram no campo! A torcida vibra intensamente!` },
      { minute: 0, type: 'INFO', description: `${homeClub.logo} ${homeClub.name} vs ${awayClub.logo} ${awayClub.name} está prestes a começar!` }
    ];
  }

  static processAction(
    match: Match,
    userAction: UserAction,
    userClub: Club,
    opponentClub: Club,
    userTeam: Character[],
    opponentTeam: Character[],
    currentMinute: number,
    specialEnergy: number // 0 a 100
  ): { updatedMatch: Match; nextMinute: number; crowdReaction: string; gainedSpecialEnergy: number } {
    
    const activePlayer = userTeam[Math.floor(Math.random() * userTeam.length)];
    const opponentPlayer = opponentTeam[Math.floor(Math.random() * opponentTeam.length)];

    let eventType: MatchEvent['type'] = 'INFO';
    let description = '';
    let crowdReaction = 'A torcida canta sem parar nas arquibancadas...';
    let addedEnergy = 15; // Energia especial ganha por ação executada

    // Modificadores baseados na energia/estamina do jogador ativo
    const userStrength = (activePlayer.stats.speed + activePlayer.stats.technique + activePlayer.stats.precision) / 3;
    const opponentStrength = (opponentPlayer.stats.defense + opponentPlayer.stats.agility + opponentPlayer.stats.stamina) / 3;
    
    const roll = Math.random() * 20 - 10;
    let outcome = userStrength - opponentStrength + roll;

    // Se usar a habilidade especial
    if (userAction === 'SPECIAL_SKILL' && specialEnergy >= 100) {
      outcome += 25; // Bônus massivo no lance
      addedEnergy = -100; // consome toda a energia especial
      eventType = 'GOAL';
      match.homeScore += 1;
      match.shotsHome += 1;
      description = `💥 PODER VEGETAL! ${activePlayer.name} ativa sua habilidade especial "${activePlayer.specialAbility.name}"! Um chute sobre-humano carregado que estufa as redes!`;
      crowdReaction = `🔥 EXPLOSÃO CELESTIAL! A torcida vai à loucura com o poder especial de ${activePlayer.name}!`;
      
      const newEvent: MatchEvent = {
        minute: currentMinute,
        type: eventType,
        description,
        playerName: activePlayer.name,
        clubName: userClub.name
      };
      match.events.push(newEvent);
      VeggieDatabase.updateMissionProgress('mission_daily_goals', 1);

      return {
        updatedMatch: match,
        nextMinute: currentMinute + 6,
        crowdReaction,
        gainedSpecialEnergy: addedEnergy
      };
    }

    // Chance de falta/cartão cometidos pelo oponente
    if (Math.random() > 0.85) {
      eventType = 'FOUL';
      const cardRoll = Math.random();
      if (cardRoll > 0.7) {
        description = `🟨 Cartão Amarelo! ${opponentPlayer.name} para a jogada com um carrinho perigoso em ${activePlayer.name}.`;
        crowdReaction = 'A torcida vaia intensamente a jogada violenta!';
      } else {
        description = `⚠️ Falta! ${opponentPlayer.name} empurra ${activePlayer.name} na disputa aérea.`;
        crowdReaction = 'O técnico reclama com o quarto árbitro à beira do campo.';
      }
      
      const newEvent: MatchEvent = {
        minute: currentMinute,
        type: eventType,
        description,
        playerName: opponentPlayer.name,
        clubName: opponentClub.name
      };
      match.events.push(newEvent);

      return {
        updatedMatch: match,
        nextMinute: currentMinute + 4,
        crowdReaction,
        gainedSpecialEnergy: addedEnergy
      };
    }

    switch (userAction) {
      case 'ATTACK':
        match.possession = Math.min(80, match.possession + 10);
        description = `${activePlayer.name} avança em velocidade, conduzindo a bola para a área adversária.`;
        crowdReaction = 'Os torcedores se levantam, empurrando o time para o ataque!';
        break;

      case 'PASS':
        match.passesHome += 1;
        if (outcome > -2) {
          match.possession = Math.min(90, match.possession + 15);
          description = `${activePlayer.name} dá um passe curto preciso, encontrando espaço livre no meio de campo.`;
          crowdReaction = 'Excelente trabalho de equipe! A torcida aplaude o toque de bola.';
        } else {
          match.possession = Math.max(10, match.possession - 15);
          eventType = 'SAVE';
          description = `${opponentPlayer.name} se antecipa e rouba a bola de forma limpa.`;
          crowdReaction = 'Lamento coletivo dos torcedores nas arquibancadas com a perda da posse.';
        }
        break;

      case 'DRIBBLE':
        if (outcome > 0) {
          match.possession = Math.min(95, match.possession + 20);
          description = `${activePlayer.name} faz uma finta desconcertante e passa por ${opponentPlayer.name}!`;
          crowdReaction = 'Espetacular! O estádio vai ao delírio com o drible!';
        } else {
          match.possession = Math.max(10, match.possession - 20);
          description = `${opponentPlayer.name} faz um desarme perfeito por baixo.`;
          crowdReaction = 'Frustração geral nas arquibancadas com o desarme.';
        }
        break;

      case 'SHOOT':
        match.shotsHome += 1;
        if (match.possession > 50 && outcome > 2) {
          match.homeScore += 1;
          eventType = 'GOAL';
          description = `⚽ GOOOOOL! ${activePlayer.name} solta uma bomba no ângulo! Sem chances de defesa!`;
          crowdReaction = '💥 EXPLOSÃO DE ALEGRIA NO ESTÁDIO! Sinalizadores acesos e muita festa!';
          VeggieDatabase.updateMissionProgress('mission_daily_goals', 1);
        } else if (outcome > -5) {
          eventType = 'SAVE';
          description = `${activePlayer.name} chuta forte, mas o goleiro faz uma ponte espetacular para defender!`;
          crowdReaction = 'Que defesa! O estádio inteiro bate palmas.';
        } else {
          eventType = 'MISS';
          description = `${activePlayer.name} tenta colocar, mas a bola sai tirando tinta da trave.`;
          crowdReaction = 'Uhhhh! Quase o gol! Torcida lamenta.';
        }
        break;

      case 'DEFEND':
        match.possession = Math.max(30, match.possession - 10);
        description = `${userClub.name} recua as linhas e organiza um ferrolho defensivo sólido.`;
        crowdReaction = 'A torcida organizada dita o ritmo com os bumbos.';
        break;

      case 'COUNTER_ATTACK':
        if (outcome > -3) {
          match.possession = Math.min(85, match.possession + 25);
          match.shotsHome += 1;
          if (outcome > 5) {
            match.homeScore += 1;
            eventType = 'GOAL';
            description = `⚽ GOOOOOL! Contra-ataque mortal! ${activePlayer.name} recebe livre e bate de primeira!`;
            crowdReaction = 'Incrível! A arena treme com a velocidade do gol!';
            VeggieDatabase.updateMissionProgress('mission_daily_goals', 1);
          } else {
            description = `Contra-ataque rápido! ${activePlayer.name} chuta cruzado e a bola sai pela linha de fundo.`;
            crowdReaction = 'Quase! A torcida aplaude o contra-ataque rápido.';
          }
        } else {
          match.possession = Math.max(20, match.possession - 15);
          description = `O contra-ataque é cortado no início por ${opponentPlayer.name}.`;
          crowdReaction = 'Suspiro de alívio da torcida visitante.';
        }
        break;
      
      default:
        break;
    }

    if (Math.random() > 0.75 && userAction !== 'DEFEND') {
      const oppRoll = Math.random() * 20;
      if (oppRoll > 14) {
        match.awayScore += 1;
        match.shotsAway += 1;
        match.events.push({
          minute: currentMinute + 1,
          type: 'GOAL',
          description: `⚽ GOL do ${opponentClub.name}! ${opponentPlayer.name} aproveita bobeada e marca!`,
          playerName: opponentPlayer.name,
          clubName: opponentClub.name
        });
        crowdReaction = 'Silêncio na Veggie Arena, comemoração apenas na área dos visitantes.';
      } else {
        match.shotsAway += 1;
        match.events.push({
          minute: currentMinute + 1,
          type: 'SAVE',
          description: `${opponentPlayer.name} arrisca de longe, mas nosso goleiro encaixa com firmeza.`,
          playerName: opponentPlayer.name,
          clubName: opponentClub.name
        });
      }
    }

    const newEvent: MatchEvent = {
      minute: currentMinute,
      type: eventType,
      description,
      playerName: activePlayer.name,
      clubName: userClub.name
    };

    match.events.push(newEvent);

    return {
      updatedMatch: match,
      nextMinute: currentMinute + Math.floor(Math.random() * 10) + 5,
      crowdReaction,
      gainedSpecialEnergy: addedEnergy
    };
  }

  static finalizeMatch(match: Match): void {
    match.status = 'FINISHED';
    match.events.push({
      minute: 90,
      type: 'END',
      description: `Fim de jogo! O árbitro apita o final. Placar final: ${match.homeScore} x ${match.awayScore}`
    });

    const isWin = match.homeScore > match.awayScore;
    const isDraw = match.homeScore === match.awayScore;

    let coinsEarned = 50;
    let gemsEarned = 0;
    let xpEarned = 100;

    if (isWin) {
      coinsEarned = 150;
      gemsEarned = 2;
      xpEarned = 300;
    } else if (isDraw) {
      coinsEarned = 80;
      xpEarned = 150;
    }

    VeggieDatabase.addRewards(coinsEarned, gemsEarned, xpEarned);

    const profile = VeggieDatabase.getProfile();
    if (isWin) {
      profile.wins += 1;
    } else if (isDraw) {
      profile.draws += 1;
    } else {
      profile.losses += 1;
    }
    VeggieDatabase.saveProfile(profile);

    const standings = VeggieDatabase.getStandings();
    const homeIndex = standings.findIndex(s => s.clubId === match.homeClubId);
    const awayIndex = standings.findIndex(s => s.clubId === match.awayClubId);

    if (homeIndex !== -1 && awayIndex !== -1) {
      const hs = standings[homeIndex];
      const as = standings[awayIndex];

      hs.played += 1;
      hs.goalsFor += match.homeScore;
      hs.goalsAgainst += match.awayScore;
      hs.goalDifference = hs.goalsFor - hs.goalsAgainst;

      as.played += 1;
      as.goalsFor += match.awayScore;
      as.goalsAgainst += match.homeScore;
      as.goalDifference = as.goalsFor - as.goalsAgainst;

      if (isWin) {
        hs.wins += 1;
        hs.points += 3;
        as.losses += 1;
      } else if (isDraw) {
        hs.draws += 1;
        hs.points += 1;
        as.draws += 1;
        as.points += 1;
      } else {
        hs.losses += 1;
        as.wins += 1;
        as.points += 3;
      }

      const activeClubs = VeggieDatabase.getClubs().filter(c => c.active && c.id !== match.homeClubId && c.id !== match.awayClubId);
      if (activeClubs.length >= 2) {
        const c1 = activeClubs[0];
        const c2 = activeClubs[1];
        const c1Score = Math.floor(Math.random() * 4);
        const c2Score = Math.floor(Math.random() * 4);

        const c1Index = standings.findIndex(s => s.clubId === c1.id);
        const c2Index = standings.findIndex(s => s.clubId === c2.id);

        if (c1Index !== -1 && c2Index !== -1) {
          const s1 = standings[c1Index];
          const s2 = standings[c2Index];

          s1.played += 1;
          s1.goalsFor += c1Score;
          s1.goalsAgainst += c2Score;
          s1.goalDifference = s1.goalsFor - s1.goalsAgainst;

          s2.played += 1;
          s2.goalsFor += c2Score;
          s2.goalsAgainst += c1Score;
          s2.goalDifference = s2.goalsFor - s2.goalsAgainst;

          if (c1Score > c2Score) {
            s1.wins += 1;
            s1.points += 3;
            s2.losses += 1;
          } else if (c1Score === c2Score) {
            s1.draws += 1;
            s1.points += 1;
            s2.draws += 1;
            s2.points += 1;
          } else {
            s1.losses += 1;
            s2.wins += 1;
            s2.points += 3;
          }
        }
      }

      standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

      VeggieDatabase.saveStandings(standings);
    }

    VeggieDatabase.updateMissionProgress('mission_daily_play', 1);
    if (profile.wins >= 1) VeggieDatabase.triggerAchievement('first_win');
    VeggieDatabase.triggerAchievement('first_match');
  }
}
