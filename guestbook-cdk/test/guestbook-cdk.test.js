const { expect, matchTemplate, MatchStyle } = require('@aws-cdk/assert');
const cdk = require('@aws-cdk/core');
const GuestbookVpc = require('../lib/guestbook-vpc-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new GuestbookVpc.GuestbookCdkStack(app, 'MyTestStack');
    // THEN
    expect(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
