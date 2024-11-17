import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { EventBus } from '../../../../core/EventBus';
import { Cell, Game, Player, UnitType } from '../../../../core/game/Game';
import { BuildUnitIntentEvent, SendNukeIntentEvent } from '../../../Transport';
import nukeIcon from '../../../../../resources/images/NukeIconWhite.svg';
import destroyerIcon from '../../../../../resources/images/DestroyerIconWhite.svg';
import missileSiloIcon from '../../../../../resources/images/MissileSiloIconWhite.svg';
import goldCoinIcon from '../../../../../resources/images/GoldCoinIcon.svg';
import portIcon from '../../../../../resources/images/PortIcon.svg';
import { renderNumber } from '../../Utils';
import { BuildValidator } from '../../../../core/game/BuildValidator';
import { ContextMenuEvent } from '../../../InputHandler';

interface BuildItemDisplay {
    unitType: UnitType
    icon: string;
}

const buildTable: BuildItemDisplay[][] = [
    [
        { unitType: UnitType.Nuke, icon: nukeIcon },
        { unitType: UnitType.Destroyer, icon: destroyerIcon },
        { unitType: UnitType.Port, icon: portIcon },
        { unitType: UnitType.MissileSilo, icon: missileSiloIcon }
    ]
];

@customElement('build-menu')
export class BuildMenu extends LitElement {
    public game: Game;
    public eventBus: EventBus;
    public buildValidator: BuildValidator;
    private myPlayer: Player;
    private clickedCell: Cell;

    init() {
        this.eventBus.on(ContextMenuEvent, (e) => { this.hideMenu() })
    }

    static styles = css`
        :host {
            display: block;
        }
        .build-menu {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            background-color: #1E1E1E;
            padding: 15px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            max-width: 95vw;
            max-height: 95vh;
            overflow-y: auto;
        }
        .build-row {
            display: flex;
            justify-content: center;
            width: 100%;
        }
        .build-button {
            width: 120px;
            height: 120px;
            border: 2px solid #444;
            background-color: #2C2C2C;
            color: white;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin: 8px;
            padding: 10px;
        }
        .build-button:not(:disabled):hover {
            background-color: #3A3A3A;
            transform: scale(1.05);
            border-color: #666;
        }
        .build-button:not(:disabled):active {
            background-color: #4A4A4A;
            transform: scale(0.95);
        }
        .build-button:disabled {
            background-color: #1A1A1A;
            border-color: #333;
            cursor: not-allowed;
            opacity: 0.7;
        }
        .build-button:disabled img {
            opacity: 0.5;
        }
        .build-button:disabled .build-cost {
            color: #FF4444;
        }
        .build-icon {
            font-size: 40px;
            margin-bottom: 5px;
        }
        .build-name {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .build-cost {
            font-size: 14px;
        }
        .hidden {
            display: none !important;
        }
            
        @media (max-width: 600px) {
            .build-button {
                width: 100px;
                height: 100px;
                margin: 5px;
            }
            .build-icon {
                font-size: 32px;
            }
            .build-name {
                font-size: 12px;
            }
            .build-cost {
                font-size: 10px;
            }
        }
        @media (max-width: 400px) {
            .build-button {
                width: 80px;
                height: 80px;
                margin: 3px;
            }
            .build-icon {
                font-size: 28px;
            }
        }
    `;

    @state()
    private _hidden = true;

    private canBuild(item: BuildItemDisplay): boolean {
        if (this.myPlayer == null) {
            return false
        }
        return this.buildValidator.canBuild(this.myPlayer, this.game.tile(this.clickedCell), item.unitType)
    }

    public onBuildSelected = (item: BuildItemDisplay) => {
        switch (item.unitType) {
            case UnitType.Nuke:
                this.eventBus.emit(new SendNukeIntentEvent(this.myPlayer, this.clickedCell, null))
                break
            case UnitType.Destroyer:
                this.eventBus.emit(new BuildUnitIntentEvent(UnitType.Destroyer, this.clickedCell))
                break
            case UnitType.Port:
                this.eventBus.emit(new BuildUnitIntentEvent(UnitType.Port, this.clickedCell))
                break
            case UnitType.MissileSilo:
                this.eventBus.emit(new BuildUnitIntentEvent(UnitType.MissileSilo, this.clickedCell))
        }
        this.hideMenu()
    };

    render() {
        return html`
            <div class="build-menu ${this._hidden ? 'hidden' : ''}">
                ${buildTable.map(row => html`
                    <div class="build-row">
                        ${row.map(item => html`
                       <button 
                           class="build-button" 
                           @click=${() => this.onBuildSelected(item)}
                           ?disabled=${!this.canBuild(item)}
                           title=${!this.canBuild(item) ? 'Not enough money' : ''}
                       >
                            <img src=${item.icon} alt="${item.unitType}" width="40" height="40">
                            <span class="build-name">${item.unitType}</span>
                            <span class="build-cost">
                                ${renderNumber(this.game ? this.game.unitInfo(item.unitType).cost : 0)}
                                <img src=${goldCoinIcon} alt="gold" width="12" height="12" style="vertical-align: middle;">
                            </span>
                        </button> 
                        `)}
                    </div>
                `)}
            </div>
        `;
    }

    hideMenu() {
        this._hidden = true;
        this.requestUpdate();
    }

    showMenu(player: Player, clickedCell: Cell) {
        this.myPlayer = player;
        this.clickedCell = clickedCell;
        this._hidden = false;
        this.requestUpdate();
    }

    get isVisible() {
        return !this._hidden;
    }
}