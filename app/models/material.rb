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

class Material < ActiveRecord::Base
  # attr_accessible :title, :body
end
