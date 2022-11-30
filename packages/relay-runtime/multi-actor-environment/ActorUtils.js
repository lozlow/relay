/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

const ACTOR_IDENTIFIER_FIELD_NAME = 'actor_key';

import type {ActorIdentifier} from './ActorIdentifier';

const {getActorIdentifier} = require('./ActorIdentifier');

function getActorIdentifierFromPayload(payload: mixed): ?ActorIdentifier {
  if (
    payload != null &&
    typeof payload === 'object' &&
    typeof payload[ACTOR_IDENTIFIER_FIELD_NAME] === 'string'
  ) {
    return getActorIdentifier(payload[ACTOR_IDENTIFIER_FIELD_NAME]);
  }
}

module.exports = {
  ACTOR_IDENTIFIER_FIELD_NAME,
  getActorIdentifierFromPayload,
};
