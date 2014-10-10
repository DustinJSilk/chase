-- Info:
--
-- Send HTTP data with node:
-- http://stackoverflow.com/questions/17121846/node-js-how-to-send-headers-with-form-data-using-request-module
--
-- New ways to have select drop downs
-- https://medium.com/@mibosc/responsive-design-why-and-how-we-ditched-the-good-old-select-element-bc190d62eff5






--
--	Initial Get - returns:
--	{success:true,'companyList':[{'configid':1,'companyname':'Machine Group (Pty) Ltd'}]
--	,documentData:{rememberme:false,userid:'',company:'1',email:'',password:''},passwordComplexity : {minPasswordLength:5,enforceAlphaNumeric:false}}
--

http://192.168.1.53/ChaseMachine/Login.aspx

Host: 192.168.1.53
Connection: keep-alive
Content-Length: 7
Accept: */*
Origin: http://192.168.1.53
X-Requested-With: XMLHttpRequest
User-Agent: Fiddler
Content-Type: application/x-www-form-urlencoded
Referer: http://192.168.1.53/ChaseMachine/login.aspx?ReturnUrl=%2fchasemachine
Accept-Encoding: gzip,deflate
Accept-Language: en-US,en;q=0.8


req=get




--
--	Login form details
--
http://192.168.1.53/ChaseMachine/Login.aspx

Host: 192.168.1.53
Connection: keep-alive
Content-Length: 86
Accept: */*
Origin: http://192.168.1.53
X-Requested-With: XMLHttpRequest
User-Agent: Fiddler
Content-Type: application/x-www-form-urlencoded
Referer: http://192.168.1.53/ChaseMachine/login.aspx?ReturnUrl=%2fchasemachine
Accept-Encoding: gzip,deflate
Accept-Language: en-US,en;q=0.8

req=auth&cid=1&cusid=&em=dustin.silk&pw=Machine031&np=&rm=true&changep=false&iut=false




--
--	Now use cookies to get data associated with the user - cookies are sent by chase need to be added. cookies expire in 2044
--

POST http://192.168.1.53/ChaseMachine/ExtJs/Ajax/Tools/TimeSheets.ashx HTTP/1.1
Host: 192.168.1.53
Connection: keep-alive
Content-Length: 7
Accept: */*
Origin: http://192.168.1.53
X-Requested-With: XMLHttpRequest
User-Agent: Fiddler
Content-Type: application/x-www-form-urlencoded
Accept-Encoding: gzip,deflate
Accept-Language: en-US,en;q=0.8
Cookie: ys-TimeSheetAddLineBy=s%3ATimeSheetAddByClient; ys-gridSettings=o%3AMy%20Tasks%3Do%253AsortSettings%253Do%25253AcolumnName%25253Ds%2525253Afinishdate%25255EsortOrder%25253Ds%2525253ADESC%5ETimeSheets%3Do%253AsortSettings%253Do%25253AcolumnName%25253Ds%2525253Aclient%25255EsortOrder%25253Ds%2525253Aasc%255EitemOrderSettings%253Do%25253AitemOrder%25253Da%2525253A; LastSelectedUser=280; LastSelectedConfig=1; LastEmail=dustin.silk; rememberme=True; LastPwd=Machine031; ChaseAuth=55B74390B3D757375E96C80C3F88695A5C6C21BB814DA711EC899D3C86B721073E918627A5C07B8159FDC7B4E1E0B032CFFB2444D00AF158316C2BC9C4F31C8537150EF916EDAE45E01361D45629D8DBE88DD122BFB65343AF20DE30E19AB09642C5652B56B1F95271BAD5F7E360B5575FE05FD57C5CA399732A37C0CB01EA394D0394332C935EDCD53EB042B0A8A9F27FA3E1A6954B642BADC2C86F4108E7BC; ASP.NET_SessionId=nnu5enwx1ws3mlke3wngiqwg

req=get