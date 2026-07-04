"""Unit tests for the argon2 password-hashing migration (app/core/auth.py).

Locks in the migration contract: new hashes are argon2, legacy bcrypt hashes
still verify (existing users can log in), and bcrypt is flagged for the
transparent upgrade-on-login re-hash. Pure passlib — no DB needed.
"""
from passlib.context import CryptContext

from app.core.auth import hash_password, verify_password, pwd_context

# Legacy-shaped context to fabricate the bcrypt hashes existing users have.
_legacy_bcrypt = CryptContext(schemes=["bcrypt"])


class TestArgon2Migration:
    def test_new_hashes_are_argon2(self):
        assert hash_password("Some!Passw0rd").startswith("$argon2")

    def test_argon2_round_trip(self):
        hashed = hash_password("Some!Passw0rd")
        assert verify_password("Some!Passw0rd", hashed)
        assert not verify_password("wrong-password", hashed)

    def test_legacy_bcrypt_still_verifies(self):
        legacy = _legacy_bcrypt.hash("Old!Passw0rd")
        assert verify_password("Old!Passw0rd", legacy)
        assert not verify_password("wrong-password", legacy)

    def test_bcrypt_is_flagged_for_upgrade(self):
        legacy = _legacy_bcrypt.hash("Old!Passw0rd")
        assert pwd_context.needs_update(legacy)

    def test_argon2_is_not_flagged_for_upgrade(self):
        assert not pwd_context.needs_update(hash_password("Some!Passw0rd"))
