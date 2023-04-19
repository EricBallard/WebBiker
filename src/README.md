# WebBiker
Ride the gnar with WebBiker, a procedurally generated 2d  motocross game supporting desktop and mobile!
 
NOTES:
PHP security measures;

0) User-agent/web-driver check

1) Only allow ajax request with xrequestedwith header

2) PHP session check

3) Cookie check

4) URL parameter

5) JWT validation
Encrypted info in token;
expiration
agent
ip

Example, valid format request with expired JWT:

http://localhost:80/php/submit_score.php?initials=edb&score=1337&auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpcCI6Ijo6MSIsImFnZW50IjoiTW96aWxsYVwvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpIEFwcGxlV2ViS2l0XC81MzcuMzYgKEtIVE1MLCBsaWtlIEdlY2tvKSBDaHJvbWVcLzEwMS4wLjQ5NTEuNTQgU2FmYXJpXC81MzcuMzYiLCJleHBpcmF0aW9uIjoxNjUxODI2NTE1fQ.77myzQ618e_mqMJc5xse1Cz8Vm72RQ8E70nuTXbQjxM