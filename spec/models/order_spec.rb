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
  pending "add some examples to (or delete) #{__FILE__}"
end
