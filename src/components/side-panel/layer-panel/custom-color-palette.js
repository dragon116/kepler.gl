
import React, {Component, createRef} from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import styled, {css} from 'styled-components';
import {sortableContainer, sortableElement, sortableHandle} from 'react-sortable-hoc';
import onClickOutside from 'react-onclickoutside';

import {Button, InlineInput} from 'components/common/styled-components';
import {VertDots, Trash} from 'components/common/icons';
import {arrayMove} from 'utils/data-utils';

const dragHandleActive = css`
  .layer__drag-handle {
    color: ${props => props.theme.textColorHl};
    opacity: 1;
    cursor: move;
  }
`;

const StyledCustomColorPalette = styled.div`
  background-color: ${props => props.theme.panelBackground}
  min-width: 300px;
  padding: 10px 0px;
`

const StyledSortableItem = styled.div`
  display: flex;
  align-items: center;
  padding-top: 6px;
  padding-bottom: 6px;
  z-index: ${props => props.theme.dropdownWrapperZ + 1};

  :not(.sorting) {
    :hover {
      background-color: ${props => props.theme.panelBackgroundHover};
      ${dragHandleActive}
    }
  }

  &.sorting-colors {
    background-color: ${props => props.theme.panelBackgroundHover};
    ${dragHandleActive}
  }
`;

const StyledDragHandle = styled.div`
  display: flex;
  align-items: center;
  opacity: 0;
`;

const StyledTrash = styled.div`
  color: ${props => props.theme.textColor};
  svg {
    :hover {
      color: ${props => props.theme.subtextColorActive};
    }
  }
  height: 12px;
  margin-left: 12px;
  margin-right: 12px;
  :hover {
    cursor: pointer;
  }
`;

const StyledLine = styled.div`
  width: calc(100% - 16px);
  height: 1px;
  background-color: ${props => props.theme.labelColor};
  margin-top: 8px;
  margin-left: 8px;
`;

const StyledSwatch = styled.div.attrs({
  className: 'custom-palette__swatch'
})`
  background-color: ${props => props.color};
  width: 32px;
  height: 18px;
  display: inline-block;
  :hover {
    box-shadow: ${props => props.theme.boxShadow};
    cursor: pointer;
  }
`;

const StyledColorRange = styled.div`
  padding: 0 8px;
  :hover {
    background-color: ${props => props.theme.panelBackgroundHover};
    cursor: pointer;
  }
`;

const StyledButtonContainer = styled.div`
  margin-top: 11px;
  display: flex;
  justify-content: space-between;
`;

const StyledConfirmButtonContainer = styled.div`
  display: flex;
  direction: rtl;
`;

const StyledColorLabel = styled.div`
  margin-left: 6px;
  color: ${props => props.theme.textColorHl};
  font-size: 10px;
`

const StyledInlineInput = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  input {
    color: ${props => props.theme.textColorHl};
    font-size: 10px;
    width: 35px;
    text-align: center;
    padding: 0px 2px;
    margin: 0px;
  }
`;

const StyledDash = styled.div`
  color: ${props => props.theme.textColorHl};
  margin: 0px 3px;
`

const SortableItem = sortableElement(({children, isSorting}) => (
  <StyledSortableItem
    className={classnames('custom-palette__sortable-items', {sorting: isSorting})}
  >
    {children}
  </StyledSortableItem>
));

const SortableContainer = sortableContainer(({children}) => <div>{children}</div>);

const DragHandle = sortableHandle(({className, children}) => (
  <StyledDragHandle className={className}>{children}</StyledDragHandle>
));

class CustomColorPalette extends Component {
  static propTypes = {
    customColorPalette: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      category: PropTypes.string,
      colors: PropTypes.arrayOf(PropTypes.string)
    }),
    setCustomColorPalette: PropTypes.func,
    onApply: PropTypes.func,
    onCancel: PropTypes.func
  };

  state = {
    isSorting: false
  };

  root = createRef();

  handleClickOutside = e => {
    this.props.onCancel();
  };

  _setColorPaletteUI(colorMap) {
    this.props.setCustomColorPalette({
      ...this.props.customColorPalette,
      colorMap
    });
  }

  _onColorDelete = color => {
    let { colorMap } = this.props.customColorPalette;
    delete colorMap[color];
    this._setColorPaletteUI(colorMap);
  };

  _onColorAdd = () => {
    let { colorMap } = this.props.customColorPalette;
    // add the last color
    this._setColorPaletteUI(colorMap);
  };

  _onApply = event => {
    event.stopPropagation();
    event.preventDefault();
    this.props.onCancel();
    this.props.onApply(this.props.customColorPalette, event);
  };

  _onSortEnd = ({oldIndex, newIndex}) => {
    const {colors} = this.props.customColorPalette;
    const newColors = arrayMove(colors, oldIndex, newIndex);
    this._setColorPaletteUI(newColors);
    this.setState({isSorting: false});
  };

  _onSortStart = () => {
    this.setState({isSorting: true});
  };

  _inputColorValue = (color, {target: {value}}) => {
    let { colorMap } = this.props.customColorPalette;
    // colorMap[color] = value;
    // this._setColorPaletteUI(colorMap);
  };

  render() {
    const {selected} = this.props;
    const colors = Object.entries(selected);

    return (
      <StyledCustomColorPalette ref={this.root}>
        <StyledColorRange>
          {/* <ColorPalette colors={colors} /> */}
        </StyledColorRange>
        <SortableContainer
          className="custom-palette-container"
          onSortEnd={this._onSortEnd}
          onSortStart={this._onSortStart}
          lockAxis="y"
          helperClass="sorting-colors"
          useDragHandle
        >
          {colors.map(([color, value], index) => (
            <SortableItem key={index} index={index} isSorting={this.state.isSorting}>
              <DragHandle className="layer__drag-handle">
                <VertDots height="20px" />
              </DragHandle>
              <StyledSwatch color={color} />
              <StyledColorLabel>
                {color.toUpperCase()}
              </StyledColorLabel>
              <StyledInlineInput>
                <InlineInput
                  type="text"
                  value={(index === 0 ? 0 : colors[index-1][1]).toFixed(1)}
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  id="input-layer-label"
                />
                <StyledDash>{"-"}</StyledDash>
                <InlineInput
                  type="text"
                  value={value.toFixed(1)}
                  onClick={e => {
                    e.stopPropagation();
                  }}
                  onChange={e => this._inputColorValue(color, e)}
                  id="input-layer-label"
                />
              </StyledInlineInput>
              <StyledTrash onClick={() => this._onColorDelete(color)}>
                <Trash className="trashbin" />
              </StyledTrash>
            </SortableItem>
          ))}
        </SortableContainer>
        <StyledLine />
        <StyledButtonContainer>
          {/* Add Step Button */}
          <Button className="add-step__button" link onClick={this._onColorAdd}>
            + Add Step
          </Button>
          {/* Cancel or Confirm Buttons */}
          <StyledConfirmButtonContainer>
            <Button className="confirm-apply__button" link onClick={this._onApply}>
              Confirm
            </Button>
            <Button link onClick={this.props.onCancel}>
              Cancel
            </Button>
          </StyledConfirmButtonContainer>
        </StyledButtonContainer>
      </StyledCustomColorPalette>
    );
  }
}

export default onClickOutside(CustomColorPalette);
