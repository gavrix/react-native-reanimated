import { Image, Text, View, ScrollView } from 'react-native';
import Easing from './Easing';
import AnimatedClock from './core/AnimatedClock';
import AnimatedValue from './core/AnimatedValue';
import AnimatedNode from './core/AnimatedNode';
import * as base from './base';
import * as derived from './derived';
import createAnimatedComponent from './createAnimatedComponent';
import decay from './animations/decay';
import timing from './animations/timing';
import spring from './animations/spring';
import TimingAnimation from './animations/TimingAnimation';
import SpringAnimation from './animations/SpringAnimation';
import DecayAnimation from './animations/DecayAnimation';
import { addWhitelistedNativeProps } from './ConfigHelper';

function backwardsCompatibleAnim(node, AnimationClass) {
  return (clock, state, config) => {
    if (config !== undefined) {
      return node(clock, state, config);
    }
    // reassign to match spec of old Animated lib where first arg was value
    // and second arg was animation config
    const _value = clock;
    const _config = state;

    const newValue = new AnimatedValue(0);
    const newClock = new AnimatedClock();
    const state = {
      finished: new AnimatedValue(0),
      position: newValue,
      time: new AnimatedValue(0),
      frameTime: new AnimatedValue(0),
    };

    const currentNode = base.block([
      base.cond(base.clockRunning(newClock), 0, [
        base.set(newValue, _value),
        base.startClock(newClock),
      ]),
      node(newClock, state, _config),
      base.cond(state.finished, base.stopClock(newClock)),
      base.cond(state.finished, base.call([], () => dummyNode.__detach())),
      state.position,
    ]);
    const setNode = base.set(_value, currentNode);
    const dummyNode = base.dummyFinal(setNode);
    return {
      start: () => {
        dummyNode.__addChild(_value);
      },
    };
  };
}

const Animated = {
  // components
  View: createAnimatedComponent(View),
  Text: createAnimatedComponent(Text),
  Image: createAnimatedComponent(Image),
  ScrollView: createAnimatedComponent(ScrollView),

  // classes
  Clock: AnimatedClock,
  Value: AnimatedValue,
  Node: AnimatedNode,

  // operations
  ...base,
  ...derived,

  // animations
  decay: backwardsCompatibleAnim(decay, DecayAnimation),
  timing: backwardsCompatibleAnim(timing, TimingAnimation),
  spring: backwardsCompatibleAnim(spring, SpringAnimation),

  // configuration
  addWhitelistedNativeProps,
};

export default Animated;

export { Easing };
