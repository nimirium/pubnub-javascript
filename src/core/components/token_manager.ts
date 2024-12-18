/**
 * PubNub Access Token Manager module.
 *
 * @internal
 */

import Cbor from '../../cbor/common';
import * as PAM from '../types/api/access-manager';
import { Payload } from '../types/api';

// --------------------------------------------------------
// ------------------------ Types -------------------------
// --------------------------------------------------------
// region Types

/**
 * Raw parsed token.
 *
 * Representation of data stored in base64-encoded access token.
 */
type RawToken = {
  /**
   * Token version.
   */
  v: number;

  /**
   * Token generation date time.
   */
  t: number;

  /**
   * Maximum duration (in minutes) during which token will be valid.
   */
  ttl: number;

  /**
   * Permissions granted to specific resources.
   */
  res: Record<'chan' | 'grp' | 'uuid', Record<string, number>>;

  /**
   * Permissions granted to resources which match specified regular expression.
   */
  pat: Record<'chan' | 'grp' | 'uuid', Record<string, number>>;

  /**
   * The uuid that is exclusively authorized to use this token to make API requests.
   */
  uuid?: string;

  /**
   * PAM token content signature.
   */
  sig: ArrayBuffer;

  /**
   * Additional information which has been added to the token.
   */
  meta?: Payload;
};
// endregion

/**
 * REST API access token manager.
 *
 * Manager maintains active access token and let parse it to get information about permissions.
 *
 * @internal
 */
export class TokenManager {
  /**
   * Currently used REST API Access token.
   */
  private token?: string;

  constructor(private readonly cbor: Cbor) {}

  /**
   * Update REST API access token.
   *
   * **Note:** Token will be applied only for next requests and won't affect ongoing requests.
   *
   * @param [token] - Access token which should be used to access PubNub REST API.
   */
  public setToken(token?: string) {
    if (token && token.length > 0) this.token = token;
    else this.token = undefined;
  }

  /**
   * REST API access token.
   *
   * @returns Previously configured REST API access token.
   */
  public getToken() {
    return this.token;
  }

  /**
   * Parse Base64-encoded access token.
   *
   * @param tokenString - Base64-encoded access token.
   *
   * @returns Information about resources and permissions which has been granted for them.
   */
  public parseToken(tokenString: string) {
    const parsed = this.cbor.decodeToken(tokenString) as RawToken;

    if (parsed !== undefined) {
      const uuidResourcePermissions = parsed.res.uuid ? Object.keys(parsed.res.uuid) : [];
      const channelResourcePermissions = Object.keys(parsed.res.chan);
      const groupResourcePermissions = Object.keys(parsed.res.grp);
      const uuidPatternPermissions = parsed.pat.uuid ? Object.keys(parsed.pat.uuid) : [];
      const channelPatternPermissions = Object.keys(parsed.pat.chan);
      const groupPatternPermissions = Object.keys(parsed.pat.grp);

      const result: PAM.Token = {
        version: parsed.v,
        timestamp: parsed.t,
        ttl: parsed.ttl,
        authorized_uuid: parsed.uuid,
        signature: parsed.sig,
      };

      const uuidResources = uuidResourcePermissions.length > 0;
      const channelResources = channelResourcePermissions.length > 0;
      const groupResources = groupResourcePermissions.length > 0;

      if (uuidResources || channelResources || groupResources) {
        result.resources = {};

        if (uuidResources) {
          const uuids: typeof result.resources.uuids = (result.resources.uuids = {});
          uuidResourcePermissions.forEach((id) => (uuids[id] = this.extractPermissions(parsed.res.uuid[id])));
        }

        if (channelResources) {
          const channels: typeof result.resources.channels = (result.resources.channels = {});
          channelResourcePermissions.forEach((id) => (channels[id] = this.extractPermissions(parsed.res.chan[id])));
        }

        if (groupResources) {
          const groups: typeof result.resources.groups = (result.resources.groups = {});
          groupResourcePermissions.forEach((id) => (groups[id] = this.extractPermissions(parsed.res.grp[id])));
        }
      }

      const uuidPatterns = uuidPatternPermissions.length > 0;
      const channelPatterns = channelPatternPermissions.length > 0;
      const groupPatterns = groupPatternPermissions.length > 0;

      if (uuidPatterns || channelPatterns || groupPatterns) {
        result.patterns = {};

        if (uuidPatterns) {
          const uuids: typeof result.patterns.uuids = (result.patterns.uuids = {});
          uuidPatternPermissions.forEach((id) => (uuids[id] = this.extractPermissions(parsed.pat.uuid[id])));
        }

        if (channelPatterns) {
          const channels: typeof result.patterns.channels = (result.patterns.channels = {});
          channelPatternPermissions.forEach((id) => (channels[id] = this.extractPermissions(parsed.pat.chan[id])));
        }

        if (groupPatterns) {
          const groups: typeof result.patterns.groups = (result.patterns.groups = {});
          groupPatternPermissions.forEach((id) => (groups[id] = this.extractPermissions(parsed.pat.grp[id])));
        }
      }

      if (parsed.meta && Object.keys(parsed.meta).length > 0) result.meta = parsed.meta;

      return result;
    }

    return undefined;
  }

  /**
   * Extract resource access permission information.
   *
   * @param permissions - Bit-encoded resource permissions.
   *
   * @returns Human-readable resource permissions.
   */
  private extractPermissions(permissions: number) {
    const permissionsResult: PAM.Permissions = {
      read: false,
      write: false,
      manage: false,
      delete: false,
      get: false,
      update: false,
      join: false,
    };

    if ((permissions & 128) === 128) permissionsResult.join = true;
    if ((permissions & 64) === 64) permissionsResult.update = true;
    if ((permissions & 32) === 32) permissionsResult.get = true;
    if ((permissions & 8) === 8) permissionsResult.delete = true;
    if ((permissions & 4) === 4) permissionsResult.manage = true;
    if ((permissions & 2) === 2) permissionsResult.write = true;
    if ((permissions & 1) === 1) permissionsResult.read = true;

    return permissionsResult;
  }
}
