---
title: Case Study Robot Framework to Mochajs
date: 2016-10-27
draft: false
---

[[toc]]

In this document I present a case for migrating the current ED Rest unit tests 
to a Javascript test framework [Mochajs](https://mochajs.org/). I will describe 
the reasons that led me to my case. I'll also breifly descript the alternative 
Javascript test framework. 

## Reasons for Migrating from RF to Mochajs

### Using a real programming language

> The ability to describe scenarios in natural language (which is one of the strongest features of systems like RF) is worthless in unit tests. At this level of testing scenarios are for input x you get output y. RF is best suited in Acceptance Testing and Integration Testing, the top-grained verification of your system. &mdash; [Answer on Stackoverflow](http://stackoverflow.com/a/21565221/5431968)

I am writing test cases to isolated tests for REST API calls. It is much fast to write them 
in a real programing language. In Robot Framework, I would constantly need to write new keywords 
everytime I write tests. Here is an example: 

Here is an oversimplified scenario where I have to write tests for ```GET /devices``` and ```POST /devices```. Below is how I would write the tests with [Mochajs](https://mochajs.org/) and [Chajs](http://chaijs.com/) assertion library: 

```javascript
var url = 'qa-rest.elephantdrive.com';

describe('Devices', () => {
  
  describe('GET /devices')
    it('shoud GET all devices', (done) => {
      chai.request(url)
          .get('/devices')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('array');
            response.body[0].devicename.should.be('mohammad.mac.local');
            response.body.length.be.eql(10);
            done();
      })
    }) 
  })

  describe('POST /devices')
    it('shoud not POST a device without devicename', (done) => {
      let device = {
        operatingSystem: 'Windows',
        version:         '5.8.7', 
        country:         'USA'
      }
      chai.request(url)
          .post('/devices')
          .send(device)
          .end((err, response) => {
            response.should.have.status(401);
            response.body.errorMessage.should.contain('missing field');
            done();
      })
    }) 
  })

})
```

A few notes: 

* This is the entire code for those to simple tests. See how short and readable it is. 
* No external files need to be loaded. 
* Because we are using Javascript, no need for serialization functions since 
  JSON is derived from JavaScript Object. So we can just pass the Javascript object
  into the request by *stringifying* it (done by chai http library). 
* Because I am using a programming language, I can easily write fine-grained tests
  that do more coverage. 

Lets look at the other hand how the same test is written in Robot Framework: 

```shell 

*** Test Cases *** 
GET Devices 

    Next Request Should Have Status Code   200
    GET  /devices
    ${body}  Get Response Body
    @{json}  Evaluate  json.loads($body)  modules=json
    &{first_device}  Set Variable  ${json}[0];
    Should Be Equal  &{first_device}[devicename]  mohammad.mac.local 
    Length Should Be  ${json}  10

POST Devices
  
   # below I'm trying to create a json object
   ${json}  Set Json Value  {}       /operatingSystem  true
   ${json}  Set Json Value  ${json}  /version          5.8.7
   ${json}  Set Json Value  ${json}  /country          USA

   Set Request Body  ${json}
   Next Request Should Have Status Code   401
   POST /devices

   ${body}  Get Request Body
   Should Contain  ${body}  missing feild
```

Here are a few notes on Robot Framework: 

* Using keywords is very restricting and opinionated. the more complicated the 
  logic, the less readable the test case and the more tedious and cumbersome. 
* While we could encapsulate logic in keywords, the keywords library gets really 
  large and difficult to maintain. 

In conclusion, I am writing very isolated unit cases. I do need the ability to 
*quickly write tests without unnecessary overhead*.

### Convenient & Faster to Write Tests in the Same Dev Language 

I write my own support tools in Javascript that will help me quickly view user's 
accounts using the live REST service. 

* It is more intuitive to quickly write tests in the **same** development language for my tools. For examples, I use the same HTTP library for the development tools as well as the tests. 
* Tests are written in exactly the same development environment with ```npm```([npmjs.cpm](https://www.npmjs.com/)) as the command line tools i write. Therefore, everything is in one eco system, which is easy to maintain. 


## Mochajs & Chaijs Javascript Libraries 

Mochajs is a Javascript test framework while Chaijs is an assertion library. 
Both extremely popular and widle used together to write tests. 

### Mochajs 

* Simple setup. Headless running out of the box
* Supported by some CI servers and plugins for others (jenkins has a maven plugin)
* Has a huge support community; asnwers on Stackoverflow, tutorials, plugins ...etc
* Of course it is open source. 

Here is an example of Mocha's command line output for a test suite:

![mochejs](/img/mochajs.png)

Let's do a quick comparison on github in terms of popularity & community: 

```text 
Github stats           Stars     forks

Mochajs                10,661    1,606
Robot Framework        1,192     449 

Both frameworks are actively maintained
```

### Chaijs

> Chai is an assertion library, similar to Node's build in assert. It makes testing much easier by giving you lots of assertions you can run against your code. &mdash; [Chaijs Github Page](https://github.com/chaijs/chai)

Chaijs is simply an assertion library. It offers very user freindly assertion style. 
Below are some examples of the different assertion styles from their documentation page. 
See how readable and human freindly the assertions are similary to Robot Framework.

**Assertion style**

```javascript
assert.typeOf(foo, 'string'); // without optional message
assert.typeOf(foo, 'string', 'foo is a string'); // with optional message
assert.equal(foo, 'bar', 'foo equal `bar`');
assert.lengthOf(foo, 3, 'foo`s value has a length of 3');
assert.lengthOf(beverages.tea, 3, 'beverages has 3 types of tea');
```

**BDD**

```javascript
expect(foo).to.be.a('string');
expect(foo).to.equal('bar');
expect(foo).to.have.length(3);
expect(beverages).to.have.property('tea').with.length(3);
```

**Should**

```javascript
foo.should.be.a('string');
foo.should.equal('bar');
foo.should.have.length(3);
beverages.should.have.property('tea').with.length(3);
```

## Migration Plan

Since there are existing number of Robot Framework tests for ED REST, first 
thought would come to mind is the migration process. While I do not have 
an exact estimate on the amount of time it would take, it should not be very hard 
to migrate considering how straight-forward to write tests in Mochajs. 

Also, it is definitely worth the investment considering the benefits of quickly 
writing tests in an agile environment. 

## Final Thoughts 

* I write my command line tools in Javascript, therefore, it would tremendously 
  increase my performance if I write tests in the same development language. 
* Robot Framework is an over kill for small unit tests. Every time I write tests, 
  I have to create new keywords. The keyword library grows really large and hard 
  to maintain. 