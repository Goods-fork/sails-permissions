var _ = require('lodash');
var _super = require('sails-auth/api/models/User');

_.merge(exports, _super);
_.merge(exports, {
  attributes: {
    roles: {
      collection: 'Role',
      via: 'users'
    },

    /**
     * Returns this user's ownership relation to an object. If the user owns the
     * specified object directly, return 'owner'. If the user shares a
     * role with the owner, return 'role'. If the user is not the owner
     * and has no roles in common with the owner of the object, then return
     * 'none'.
     *
     * @return Promise that resolves to 'owner', 'role', or 'none'
     */
    getOwnershipRelation: function (object) {
      if (!object.owner) {
        return 'none';
      }
      if (object.owner === this.id) {
        return 'owner';
      }

      // query roles for this and object.owner and see if there are any in
      // common
      User.findOne(this.id).populate('roles').bind(this)
        .then(function (user) {
          this.roles = user.roles;
          return User.findOne(object.owner).populate('roles');
        })
        .then(function (owner) {
          var intersection = _.intersection(
            _.pluck(this.roles, 'id'),
            _.pluck(owner.roles, 'id')
          );
          if (intersection.length > 0) {
            return 'role';
          }
          else {
            return 'none';
          }
        });
    }
  }
});
