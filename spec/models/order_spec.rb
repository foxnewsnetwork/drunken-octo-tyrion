# == Schema Information
#
# Table name: orders
#
#  id          :integer          not null, primary key
#  company_id  :integer
#  plant_id    :integer
#  carrier     :string(255)
#  external_id :string(255)
#  notes       :text
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#

require 'spec_helper'

describe Order do
  describe 'sanity test' do
  	it 'should make it from a factory' do 
  		order = FactoryGirl.create :order
  		order.should be_valid
  		order.company.should be_valid
  	end # it
  end # sanity
  describe "relationships" do 
  	before :each do
  		@plant = FactoryGirl.create :plant
  		@company = FactoryGirl.create :company 
  		@material = @plant.materials.create FactoryGirl.attributes_for(:material)
  	end # each
    it "should be valid" do
      @material.should_not be_nil
    end # it
  	describe "creation" do 
  		it "should support special syntax" do 
  			lambda do 
  				@plant.sells(100, "pounds").of(@material).to(@company)
  			end.should change(Order, :count).by 1
  		end # it
  		it "should support special syntax the other way too" do 
  			lambda do 
  				@company.buys(100, "pounds").of(@material).from(@plant)
  			end.should change(Order, :count).by 1
  		end # it
      describe "multiple" do 
        before :each do 
          5.times do 
            (@materials ||= []) << @plant.materials.create( FactoryGirl.attributes_for(:material).replace :name => FactoryGirl.generate(:metal) )
            (@quantities ||= []) << ({ :quantity => rand(100), :units => "pounds" })
          end
          @forward = lambda do 
            @plant.sells(*@quantities).of(*@materials).to(@company)
          end
          @reverse = lambda do 
            @company.buys(*@quantities).of(*@materials).from(@plant)
          end 
        end # each
        it "should support syntax" do 
          @forward.should change(Order, :count).by 1
        end # it
        it "should support reverse syntax" do 
          @reverse.should change(Order, :count).by 1
        end # it
        it "should generate 5 new materials" do 
          @reverse.should change(Material, :count).by 5
        end # 
        it "should do the same for reverse" do 
          @forward.should change(Material, :count).by 5
        end # it
      end # multiple
  	end # creation
  	describe "interconnection" do 
  		before :each do 
  			@order = @plant.sells(100, "pounds").of(@material).to(@company)
  		end # each
  		it "should have the correct info" do 
  			@order.materials.first.name.should eq @material.name
  			@order.materials.first.quantity.to_s.should eq 100.0.to_s
  			@order.materials.first.units.should eq "pounds"
  		end # it
      describe "multiple" do 
        before :each do 
          @evil_material = @plant.materials.create FactoryGirl.attributes_for(:material).replace( :name => FactoryGirl.generate(:metal) )
          2.times do (@evil_quantities ||= []) << FactoryGirl.generate(:quantities) end
          @double_order = @plant.sells(*@evil_quantities).of(@material, @evil_material).to(@company)
        end # each 
        it "should match quantities name" do 
          @double_order.materials.first.name.should eq @material.name
          @double_order.materials.last.name.should eq @evil_material.name
        end # it
        it "should match quantities units" do 
          @double_order.materials.first.units.should eq @evil_quantities.first[:units]
          @double_order.materials.last.units.should eq @evil_quantities.last[:units]
        end # it
        it "should match quantities quantity" do 
          @double_order.materials.first.quantity.to_s.should eq @evil_quantities.first[:quantity].to_s
          @double_order.materials.last.quantity.to_s.should eq @evil_quantities.last[:quantity].to_s
        end # it
      end # multiople
  	end # interconnection
    describe "strange input" do 
      before :each do 
        @adamantium = FactoryGirl.create :material
      end # each
      it "should not let me sell" do 
        lambda do
          @plant.sells(123, "tons").of(@adamantium).to(@company)
        end.should_not change(Order, :count)
      end # it
      it "should not let me buy either" do 
        lambda do
          @company.buys(123, "tons").of(@adamantium).from(@plant)
        end.should_not change(Order, :count)
      end # it
    end # bad input
  end # relationships
end # Order

=begin
>>75669218

I beg to differ, tsundere DOES work in real life.

My girlfriend was pretty hardcore a tsundere herself at one point. When I first met her in high school, she always acted kind of aloof. She was pretty, with long black hair, and glasses, she seemed like a simple shy girl, but her tongue was sharp and her wit acidic. I didn't even really like her until I saw her wall-flowering at a school dance.

I saw her wall-flowering by herself staring out the window, so I went up to her and asked her to dance. She said "no", and I replied with "no means yes" and grabbed her hand and whisked her away with me. All the while I danced with her, I saw her cheeks flush with red even in the dim light and she would very often check her surroundings as if to see if anyone was watching us. But soon she began enjoying herself and her protests of "I'm going to stab you to death" slowly gave way to just flustered mumbles of "you dummy..."

After the dance, I walked her home and, as we neared her house, she turns and asked me "So... what does yes mean?" I don't answer her right away. But as I stand with her at her doorway, I reply "Yes means..." and I suddenly lean down and kiss her. She's too shocked to move, but I feel her lips part. Pulling away, I smirk at her sheepishly, "I guess yes just means you like me back". And she slugs me on the chest, "No fair!"

So I began my relationship with her, and she started opening up more and more to me. I found she was a really complex girl with lots of deep thoughts. At one point, I remember discussing deep stuff with her at one point "What exact makes us human? If we take away all our memories, experiences, would we still be what we are?". Because her dad was usually busy in the mornings, she started up a habit of coming over to my house before school to have coffee and stuff. She would always compliment me on how delicious my coffee was. 

Lately, when I'm with her as we walk to school, she would always sing cheerfully "Today is a great day", "I had coffee with otou-sama", and other random lyrics she'd come up with. Things are working out and I have a good feeling I'm going to get protected.  
=end

=begin

I met a trap through a foreign exchange program one summer several years ago. The moment I picked him up at the airport, I could tell there was something amiss about this boy. He was winsome, slender, and pretty in the sort of inconspicuous way that one can only achieve after putting in lots of effort. He was a strange boy; during the entire car ride back to my university, he hardly had more than one or two words to my questions, but seemed to have an endless amount of nervous questions for me.

As it turned out, he was assigned to live with me in the apartment I had rented (my usual roommates were all gone for the summer). So I took him to his room, told him to unpack while I went out to buy some dinner. When I returned, I noticed his suitcase was open in the corner and there were suspiciously frilly clothes clearly visible poking through. I analyze the situation: an effeminate asian boy 2 years younger than me comes to a country where he knows no one and is now showing me his girly clothes. 

I was almost certain I knew what he wanted me to do to him, but I wanted to make sure (you can't rape the willing, but you sure as hell can rape the unwilling). So after dinner, I lied to him that his door has a broken lock so he shouldn't try to lock it, and I'll be going out to buy some house supplies, but otherwise goodnight and I will see him tomorrow. He nodded, a look of relief or perhaps disappointment on his face. I went out to vons, home depot, and petco and bought some rope, a collar, one of those turkey basting things, wall and ceiling hooks,etc. etc., and went back.

Making sure to be as silent as I possibly could (I even parked further away then usual), I sneaked into my own apartment. With great satisfaction, I saw lights streaming out from underneath his door - good still awake. And, if I'm not mistaken, he's moving around in there quite a bit. 

Producing the whiskey I bought, I open his door and burst in, "Hey, here's some alcohol to help you get over your jet lag," that was, of course, my excuse. He was dressed, at that moment, in vocaloid cosplay complete with headphones and apparently dancing to what I later found out was "Luka Luka Night Fever". He stood in front of the dresser in the room and was filming himself before the mirror. The window curtains were drawn to keep out the unwanted eyes (not that there were any during summer)... but it couldn't keep me from barging in..

He literally jumped a mile up and spun around, the look of a cornered animal on his pretty face. In English broken by nervousness and panick, he stammered out something along the lines of "it's not what you think, I can't sleep."

I smirked with an expression of pure evil on my face, "Oh, I'll help you sleep." I take a swig of the whiskey from the bottle, but don't swallow. Instead, I advance on him as he backs away from me until he is pinned against the dresser. He holds up his hands in a futile attempt to keep me at bay, but I easily overpower him and pin both his wrists above him against the mirror. I lean down and kiss him, forcefully pushing all the hot burning paint-thinner liquid from my mouth into his and down his throat. 

As soon as I pull away, he collapses down onto the carpet, his skirt fluttering about him. He coughs, perhaps because he was unused to the strong liquor or perhaps some of it went down the wrong hole. "Welcome to America," I say as I bend down to pick him up. He smell, a mixture of some fancy girly shampoo and perfume, is intoxicating.

I throw him onto the nearby bed.

Pomf

He then asks, "What are we going to do on the bed, onii-san?"
=end

#https://boards.4chan.org/a/res/75655658


