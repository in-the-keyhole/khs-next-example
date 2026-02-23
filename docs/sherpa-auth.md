POST https://keyholekc.com/sherpa
{
    "action": "authenticate"
    "userid": <userid>
    "password": <password>
}

RESPONSE:
{
    "userid": <userid>,
    "token": <token>,
    "timeout": <timeout>,
    "active": <active>,
    "lastActive": <lastActive>,
    "roles": <roles>
}