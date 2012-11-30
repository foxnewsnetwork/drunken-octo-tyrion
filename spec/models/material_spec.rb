# == Schema Information
#
# Table name: materials
#
#  id         :integer          not null, primary key
#  order_id   :integer
#  plant_id   :integer
#  name       :string(255)
#  quantity   :decimal(12, 4)
#  units      :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'spec_helper'

describe Material do
  pending "add some examples to (or delete) #{__FILE__}"
end
