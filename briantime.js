"use strict";

var SlackBot = require( "slackbots" );
var moment = require( "moment-timezone" );

const pastas = require( "./pastas.json" );

const secrets = require( "./secrets.json" );

const bot = new SlackBot({
    token: secrets.apiToken,
    name: "BrianTime"
});

const icon_url = "https://s3-us-west-2.amazonaws.com/slack-files2/avatar-temp/2016-12-16/117149881201_39d1a6e237a22379970a.jpg";

bot.on( "message", data => {

    if( data.type === "message" ) {

        const text = data.text.toLowerCase();
        const parsedText = /(\d{1,2}:\d{2}[ ]*(?:am|pm))(?: to)? (local|briantime)/.exec(text);

        if( text === "briantime now" ) {
            postCurrentBrianTime( data.channel );
        } else if ( text === "briantime help" ) {
            giveHelp( data.channel );
        } else if ( parsedText ) {
            postLocalOrBrianConversion( data.channel, parsedText );
        }

    }

});

function postCurrentBrianTime( channel ) {
    var currentBrianTime = moment().tz( "Asia/Tokyo" ).format( "[*]h:mm A[* on] dddd, MMMM Do" );
    bot.postMessage(
        channel,
        `It is ${currentBrianTime} in ${randomPastaTimezone()}.`,
        { icon_url }
    );
}

function giveHelp( channel ) {

    var message = "*_こんにちは!_*\r*How to Use BrianTime*: \r - `briantime now` _returns the current BrianTime_. \r - `H:MM am/pm to briantime/local` _converts the given time to Local or BrianTime._ \r\r _ありがとう!!_ *	٩(◕‿◕)۶*";

    bot.postMessage(
        channel,
        message,
        { icon_url }
    );
}

function postLocalOrBrianConversion( channel, parsedText ) {
    const time = parsedText[1].replace( " ", "" ); // Strip whitespace from time
    const convertTo = parsedText[2];

    const initialTz = convertTo === "local" ? "Asia/Tokyo" : "America/Chicago";
    const initialPlaceName = convertTo === "local" ? randomPastaTimezone() : "Chicago";

    const finalTz = convertTo === "briantime" ? "Asia/Tokyo" : "America/Chicago";
    const finalPlaceName = convertTo === "briantime" ? randomPastaTimezone() : "Chicago";

    const initialMoment = moment.tz( `${time}`, 'h:mma', initialTz );
    const finalMoment = moment(initialMoment).tz( finalTz );

    const daysAheadInFinalLocation = finalMoment.format( "D" ) - initialMoment.format( "D" );
    var finalDay = "today";
    if( daysAheadInFinalLocation === 1 ) {
        finalDay = "tomorrow";
    } else if (daysAheadInFinalLocation === -1 ){
        finalDay = "yesterday";
    }

    const message = `${initialMoment.format( "h:mm A" )} today in ${initialPlaceName} is *${finalMoment.format( "h:mm A" )} ${finalDay}* in ${finalPlaceName}.`;

    bot.postMessage(
        channel,
        message,
        { icon_url }
    );
}

const randomPastaTimezone = () => {
    var randomIndex = Math.floor( Math.random() * pastas.length )
    return `${pastas[ randomIndex ]} Standard Time`;
}
