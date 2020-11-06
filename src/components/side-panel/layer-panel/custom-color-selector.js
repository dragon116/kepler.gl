// Copyright (c) 2020 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {Component, createRef} from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ColorPalette from 'components/side-panel/layer-panel/color-palette';
import { Portaled } from '../..';
import CustomColorPalette from './custom-color-palette';

export const ColorBlock = styled.div`
  width: 32px;
  height: 18px;
  border-radius: 1px;
  background-color: ${props => `rgb(${props.color.slice(0, 3).join(',')})`};
`;

export const ColorSelectorInput = styled.div`
  ${props => (props.inputTheme === 'secondary' ? props.theme.secondaryInput : props.theme.input)};
  height: ${props => props.theme.inputBoxHeight};

  .color-selector__selector__label {
    text-transform: capitalize;
    font-size: 12px;
    text-align: center;
    color: ${props => props.theme.inputPlaceholderColor};
  }
`;

export const InputBoxContainer = styled.div`
  display: flex;
  justify-content: space-between;

  .color-select__input-group {
    flex-grow: 1;
  }
  .color-select__input-group:nth-child(2) {
    margin-left: 12px;
  }
`;

class CustomColorSelector extends Component {
  static propTypes = {
    colorSets: PropTypes.arrayOf(
      PropTypes.shape({
        selectedColor: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.object]),
        setColor: PropTypes.func.isRequired,
        isRange: PropTypes.bool,
        label: PropTypes.string
      })
    ),
    colorUI: PropTypes.shape({
      customPalette: PropTypes.object,
      showSketcher: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
      showDropdown: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
      colorRangeConfig: PropTypes.object
    }),
    inputTheme: PropTypes.string,
    disabled: PropTypes.bool,
    setColorUI: PropTypes.func
  };

  static defaultProps = {
    colorSets: []
  };

  state = {
    showDropdown: false
  };

  node = createRef();

  _getEditing = () => {
    return this.props.colorUI ? this.props.colorUI.showDropdown : this.state.showDropdown;
  };

  _closePanelDropdown = () => {
    if (this._getEditing() === false) {
      return;
    }
    if (this.props.setColorUI) {
      this.props.setColorUI({showDropdown: false});
    } else {
      this.setState({showDropdown: false});
    }
  };

  _onSelectColor = (colorMap, e) => {
    e.stopPropagation();
    const editing = this._getEditing();
    if (this.props.colorSets[editing]) {
      this.props.colorSets[editing].setColor(color);
    }
  };

  _onSetCustomColorPalette = config => {
    this.props.setColorUI(config);
  };

  _showDropdown = (e, i) => {
    e.stopPropagation();
    e.preventDefault();

    const {colorSets, colorUI} = this.props;
    let colorMap = {};
    if (!colorUI.colorMap && colorSets[0].selectedColor) {
      for(let i =0; i<colorSets[0].selectedColor.colors.length; i++) {
        colorMap[colorSets[0].selectedColor.colors[i]] = (i+1)*10;
      }
    }
    
    if (this.props.setColorUI) {
      this.props.setColorUI({
        showDropdown: i,
        colorMap
      });
    } else {
      this.setState({showDropdown: i});
    }
  };

  render() {
    const {colorSets, disabled, inputTheme, colorUI} = this.props;

    const editing = this._getEditing();
    const currentEditing = colorSets[editing] && typeof colorSets[editing] === 'object';

    console.log("currentEditing", colorUI)
    console.log("colorSets[editing]", colorSets[editing])

    return (
      <div className="color-selector" ref={this.node}>
        <InputBoxContainer>
          {colorSets.map((cSet, i) => (
            <div className="color-select__input-group" key={i}>
              <ColorSelectorInput
                className="color-selector__selector"
                active={editing === i}
                disabled={disabled}
                inputTheme={inputTheme}
                onMouseDown={e => this._showDropdown(e, i)}
              >
                {cSet.isRange ? (
                  <ColorPalette colors={cSet.selectedColor.colors} />
                ) : (
                  <ColorBlock
                    className="color-selector__selector__block"
                    color={cSet.selectedColor}
                  />
                )}
                {cSet.label ? (
                  <div className="color-selector__selector__label">{cSet.label}</div>
                ) : null}
              </ColorSelectorInput>
            </div>
          ))}
        </InputBoxContainer>
        {
          currentEditing && 
          <Portaled isOpened={currentEditing} left={275} top={-35}>
            <div>
              <CustomColorPalette
                customColorPalette={colorUI}
                selected={colorUI.colorMap}
                onApply={this._onSelectColor}
                setCustomColorPalette={this._onSetCustomColorPalette}
                onCancel={this._closePanelDropdown}
              />
            </div>
          </Portaled>
        }
        
      </div>
    );
  }
}

export default CustomColorSelector;
