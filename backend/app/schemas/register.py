# register.py
# Request schema for POST /api/register.
#
# Registration used to take username/password as query parameters, which
# meant plaintext passwords landed in nginx access logs, browser history,
# and proxy logs. Credentials must always travel in the request body.

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=120)
    email: str = Field(min_length=3, max_length=254)
