import {Player, PlayerID, PlayerInfo, TerrainType, TerrainTypes, TerraNullius, Tile} from "../Game";
import {Colord, colord} from "colord";


export interface Config {
	theme(): Theme;
	player(): PlayerConfig
	turnIntervalMs(): number
	gameCreationRate(): number
	lobbyLifetime(): number
	numBots(): number
}

export interface PlayerConfig {
	startTroops(playerInfo: PlayerInfo): number
	troopAdditionRate(player: Player): number
	attackTilesPerTick(attacker: Player, defender: Player | TerraNullius, numAdjacentTilesWithEnemy: number): number
	attackLogic(attacker: Player, defender: Player | TerraNullius, tileToConquer: Tile): {
		attackerTroopLoss: number,
		defenderTroopLoss: number,
		tilesPerTickUsed: number
	}
	attackAmount(attacker: Player, defender: Player | TerraNullius): number
	boatAttackAmount(attacker: Player, defender: Player | TerraNullius): number
}

export interface Theme {
	playerInfoColor(id: PlayerID): Colord;
	territoryColor(id: PlayerID): Colord;
	borderColor(id: PlayerID): Colord;
	terrainColor(tile: TerrainType): Colord;
	backgroundColor(): Colord;
	font(): string;
}
